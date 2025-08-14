const prisma = require('../prisma/client');
const Page = require('../models/page');
const Joi = require('joi');
const { createError } = require('../utils/createError');
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;

// Schema validation using Joi
const createPageSchema = Joi.object({
  name: Joi.string().required(),
  name_ar: Joi.string().required(),
  slug: Joi.string().required(),
  seo_description: Joi.string().required(),
  seo_description_ar: Joi.string().required(),
  status: Joi.number().required(),
  template_id: Joi.string().required(),
  sections: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        name_ar: Joi.string().required(),
        contents: Joi.array()
          .items(
            Joi.object({
              type: Joi.string().required(),
              data: Joi.object().required(),
              data_ar: Joi.object().required(), // Adding validation for data_ar
            })
          )
          .required(),
      })
    )
    .required(),
});

const updatePageSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  name_ar: Joi.string().required(),
  slug: Joi.string().required(),
  seo_description: Joi.string().required(),
  seo_description_ar: Joi.string().required(),
  status: Joi.number().required(),
  template_id: Joi.string().required(),
  sections: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().allow(null, ""),
        name: Joi.string().required(),
        name_ar: Joi.string().required(),
        order: Joi.number().required(),
        contents: Joi.array()
          .items(
            Joi.object({
              id: Joi.string().allow(null, ""),
              type: Joi.string().required(),
              data: Joi.object().pattern(Joi.string(), Joi.any()).required(),
              data_ar: Joi.object().pattern(Joi.string(), Joi.any()).required(),
            })
          )
          .required(),
      })
    )
    .required(),
});

// Create a new page
exports.createPage = async (req, res, next) => {
  console.log(req.body);

  // Uncomment this if you need to debug section contents
  // req.body.sections.forEach((section) => {
  //   console.log(`Section Name: ${section.name}`);
  //   section.contents.forEach((content) => {
  //     console.log(`Type: ${content.type}`);
  //     console.log("Data:");
  //     console.log(content.data);
  //     console.log("Data Arabic:");
  //     console.log(content.data_ar);
  //   });
  // });

  const { error, value } = createPageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const {
    name,
    name_ar,
    slug,
    seo_description,
    seo_description_ar,
    status,
    template_id,
    sections,
  } = value;

  try {
    const existingPage = await Page.findBySlug(slug);

    if (existingPage) {
      return next(createError(400, "Slug already exists"));
    }

    const page = await prisma.newPage.create({
      data: {
        name,
        name_ar,
        slug,
        seo_description,
        seo_description_ar,
        status,
        template_id,
        sections: {
          create: sections.map((section, index) => ({
            name: section.name,
            name_ar: section.name_ar,
            order: index,
            contents: {
              create: section.contents.map((content) => {
                let data = content.data;
                let data_ar = content.data_ar;

                if (req.files && data.fileField && req.files[data.fileField]) {
                  const file = req.files[data.fileField][0];
                  data[
                    data.fileField
                  ] = `/uploads/images/blogImages/${file.filename}`;
                  data_ar[
                    data.fileField
                  ] = `/uploads/images/blogImages/${file.filename}`;
                }

                // Handle carousel images for hero section
                if (content.type === "hero_section" && data.carouselData) {
                  data.carouselData = data.carouselData.map(
                    (carouselItem, carouselIndex) => {
                      if (req.files[`carousel_images_${carouselIndex}`]) {
                        const file =
                          req.files[`carousel_images_${carouselIndex}`][0];
                        carouselItem.carouselBackgroundImage = `/uploads/images/blogImages/${file.filename}`;
                      }
                      return carouselItem;
                    }
                  );
                  data_ar.carouselData = data.carouselData;
                }

                delete data.fileField;
                delete data_ar.fileField;

                return {
                  type: content.type,
                  data: JSON.stringify(data),
                  data_ar: JSON.stringify(data_ar), // Handling data_ar field
                };
              }),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            contents: true,
          },
        },
      },
    });

    res.status(201).json(page);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Update an existing page
exports.updatePage = async (req, res, next) => {
  req.body.sections.forEach((section) => {
    console.log(`Section Name: ${section.name}`);
    section.contents.forEach((content) => {
      console.log(`Type: ${content.type}`);
      console.log("Data:");
      console.log(content.data);
      console.log("Data Arabic:");
      console.log(content.data_ar);
    });
  });

  const cleanedBody = {
    ...req.body,
    sections: req.body.sections.map((section, index) => ({
      ...section,
      order: index,
      contents: section.contents.map((content) => ({
        type: content.type,
        data: content.data,
        data_ar: content.data_ar,
      })),
    })),
  };

  const { error, value } = updatePageSchema.validate(cleanedBody);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const {
    id,
    name,
    name_ar,
    slug,
    seo_description,
    seo_description_ar,
    status,
    template_id,
    sections,
  } = value;

  try {
    const page = await Page.findById(id);

    if (!page) {
      return next(createError(404, "Page not found"));
    }

    await prisma.$transaction(
      async (prisma) => {
        await prisma.newPage.update({
          where: { id },
          data: {
            name,
            name_ar,
            slug,
            seo_description,
            seo_description_ar,
            status,
            template_id,
          },
        });

        await prisma.section.deleteMany({
          where: {
            page_id: id,
          },
        });

        for (const section of sections) {
          const createdSection = await prisma.section.create({
            data: {
              page_id: id,
              name: section.name,
              name_ar: section.name_ar,
              order: section.order,
            },
          });

          const sectionId = createdSection.id;

          for (const content of section.contents) {
            let data = content.data;
            let data_ar = content.data_ar;

            if (req.files && data.fileField && req.files[data.fileField]) {
              const file = req.files[data.fileField][0];
              data[
                data.fileField
              ] = `/uploads/images/blogImages/${file.filename}`;
              data_ar[
                data.fileField
              ] = `/uploads/images/blogImages/${file.filename}`;
            }

            // Handle carousel images for hero section
            if (content.type === "hero_section" && data.carouselData) {
              console.log("Received Carousel Data:", data.carouselData);
              const processedCarouselData = await Promise.all(
                Object.entries(data.carouselData)
                  .filter(([key, value]) => typeof value === 'object' && value !== null)
                  .map(
                    async ([key, carouselItem], carouselIndex) => {
                      console.log("Carousel Item:", carouselItem);
                      if (req.files[`carousel_images_${carouselIndex}`]) {
                        const file =
                          req.files[`carousel_images_${carouselIndex}`][0];
                        carouselItem.carouselBackgroundImage = `/uploads/images/blogImages/${file.filename}`;
                      }
                      return carouselItem;
                    }
                  )
              );

              data.carouselData = processedCarouselData.filter(
                (carouselItem) => Object.keys(carouselItem).length > 0
              );

              data_ar.carouselData = data.carouselData;
            }

            delete data.fileField;
            delete data_ar.fileField;

            await prisma.content.create({
              data: {
                section_id: sectionId,
                type: content.type,
                data: JSON.stringify(data),
                data_ar: JSON.stringify(data_ar),
              },
            });
          }
        }
      },
      { timeout: 50000 }
    );

    const updatedPage = await prisma.newPage.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            contents: true,
          },
        },
      },
    });

    res.status(200).json(updatedPage);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get all pages with optional filtering
exports.getNewPages = async (req, res, next) => {
  try {
    const allowedColumns = {
      id: Joi.string(),
      name: Joi.string(),
      name_ar: Joi.string(),
      slug: Joi.string(),
      seo_description: Joi.string(),
      seo_description_ar: Joi.string(),
      status: Joi.number(),
      template_id: Joi.string(),
      created_at: Joi.date(),
      updated_at: Joi.date(),
    };

    // Create a dynamic schema based on the allowed columns
    const filterSchema = Joi.object(
      Object.keys(allowedColumns).reduce((schema, column) => {
        schema[column] = allowedColumns[column];
        return schema;
      }, {})
    ).unknown(false); // Disallows any keys not defined in the schema

    // Validate the request query
    const { error, value } = filterSchema.validate(req.query);
    if (error) {
      return res.status(400).send({
        message: `Invalid query parameter: ${error.details[0].message}`,
      });
    }

    // Prepare filter conditions
    const filterConditions =
      Object.keys(value).length > 0
        ? Object.keys(value).reduce((obj, key) => {
            obj[key] = value[key];
            return obj;
          }, {})
        : {};

    // Get pagination parameters
    const { skip, take } = req.query;

    // Get pages using our model
    const result = await Page.findAll({
      where: filterConditions,
      orderBy: { updated_at: "desc" },
      skip,
      take
    });
    
    const pages = result.data;

    return res.json(pages);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: error.message });
  }
};

// Get page by slug
exports.getPage = async (req, res, next) => {
  const slug = req.query.slug;
  const language = req.query.lang || "en";

  try {
    const page = await Page.findBySlug(slug);

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    // Transform the page object based on the requested language
    const transformedPage = {
      ...page,
      name: language === "ar" ? page.name_ar : page.name,
      seo_description:
        language === "ar" ? page.seo_description_ar : page.seo_description,
      sections: page.sections.map((section) => ({
        ...section,
        name: language === "ar" ? section.name_ar : section.name,
        contents: section.contents.map((content) => ({
          ...content,
          data: JSON.parse(content.data), // Parse JSON string
          data_ar: JSON.parse(content.data_ar), // Parse JSON string
        })),
      })),
    };

    res.json(transformedPage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve page" });
  }
};

// Get all templates
exports.getTemplates = async (req, res, next) => {
  try {
    // Define allowed columns for filtering
    const allowedColumns = {
      id: Joi.string(),
      name: Joi.string(),
      name_ar: Joi.string(),
      description: Joi.string(),
      description_ar: Joi.string(),
      created_at: Joi.date(),
      updated_at: Joi.date(),
    };

    // Create dynamic schema based on allowed columns
    const filterSchema = Joi.object(
      Object.keys(allowedColumns).reduce((schema, column) => {
        schema[column] = allowedColumns[column];
        return schema;
      }, {})
    ).unknown(false); // Disallow unknown keys

    // Validate request query
    const { error, value } = filterSchema.validate(req.query);
    if (error) {
      return res.status(400).send({
        message: `Invalid query parameter: ${error.details[0].message}`,
      });
    }

    // Prepare filter conditions (if any)
    const filterConditions =
      Object.keys(value).length > 0
        ? Object.keys(value).reduce((obj, key) => {
            obj[key] = value[key];
            return obj;
          }, {})
        : {};

    // Find templates using our model
    const templates = await Page.findTemplates({
      where: filterConditions,
      orderBy: { updated_at: "desc" }, // Sort by latest update
    });

    return res.json(templates);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: error.message });
  }
};

// Utility function to delete files
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Delete a page
exports.deletePage = async (req, res, next) => {
  const pageId = req.params.id;
  if (!pageId) {
    return next(createError(400, "Page ID is required"));
  }

  try {
    // Retrieve the page and its associated data
    const page = await Page.findById(pageId);

    if (!page) {
      return next(createError(404, "Page not found"));
    }

    // Delete related images from the file system
    page.sections.forEach((section) => {
      section.contents.forEach((content) => {
        const data = JSON.parse(content.data);
        if (data.fileField) {
          const filePath = path.join(
            __dirname,
            "..",
            "public",
            "uploads",
            "images",
            "blogImages",
            path.basename(data[data.fileField])
          );
          deleteFile(filePath);
        }

        // Handle carousel images
        if (data.carouselData) {
          data.carouselData.forEach((carouselItem) => {
            if (carouselItem.carouselBackgroundImage) {
              const filePath = path.join(
                __dirname,
                "..",
                "public",
                "uploads",
                "images",
                "blogImages",
                path.basename(carouselItem.carouselBackgroundImage)
              );
              deleteFile(filePath);
            }
          });
        }
      });
    });

    // Delete the page from the database
    await Page.delete(pageId);

    res.status(200).json({ message: "Page deleted successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};