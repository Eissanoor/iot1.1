const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getImageUrl } = require('../utils/uploadUtils');

const createService = async (serviceData) => {
  // Convert camelCase to snake_case for database fields
  const dbData = {
    name: serviceData.name,
    display_name: serviceData.displayName,
    description: serviceData.description,
    service_type: serviceData.serviceType,
    icon: serviceData.icon,
    is_active: serviceData.isActive
  };
  
  return await prisma.service.create({
    data: dbData
  });
};

const getAllServices = async () => {
  const services = await prisma.service.findMany();
  
  // Convert snake_case to camelCase for API response
  return services.map(service => {
    const serviceObj = {
      id: service.id,
      name: service.name,
      displayName: service.display_name,
      description: service.description,
      serviceType: service.service_type,
      icon: service.icon,
      isActive: service.is_active,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    };
    
    // Add icon URL if icon exists
    if (service.icon) {
      serviceObj.iconUrl = getImageUrl(service.icon);
    }
    
    return serviceObj;
  });
};

const getServiceById = async (id) => {
  const service = await prisma.service.findUnique({
    where: { id }
  });
  
  if (!service) return null;
  
  // Convert snake_case to camelCase for API response
  const serviceObj = {
    id: service.id,
    name: service.name,
    displayName: service.display_name,
    description: service.description,
    serviceType: service.service_type,
    icon: service.icon,
    isActive: service.is_active,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt
  };
  
  // Add icon URL if icon exists
  if (service.icon) {
    serviceObj.iconUrl = getImageUrl(service.icon);
  }
  
  return serviceObj;
};

const getServiceByName = async (name) => {
  const service = await prisma.service.findUnique({
    where: { name }
  });
  
  if (!service) return null;
  
  // Convert snake_case to camelCase for API response
  const serviceObj = {
    id: service.id,
    name: service.name,
    displayName: service.display_name,
    description: service.description,
    serviceType: service.service_type,
    icon: service.icon,
    isActive: service.is_active,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt
  };
  
  // Add icon URL if icon exists
  if (service.icon) {
    serviceObj.iconUrl = getImageUrl(service.icon);
  }
  
  return serviceObj;
};

const updateService = async (id, serviceData) => {
  // Convert camelCase to snake_case for database fields
  const dbData = {};
  
  if (serviceData.name) dbData.name = serviceData.name;
  if (serviceData.displayName) dbData.display_name = serviceData.displayName;
  if (serviceData.description !== undefined) dbData.description = serviceData.description;
  if (serviceData.serviceType) dbData.service_type = serviceData.serviceType;
  if (serviceData.icon !== undefined) dbData.icon = serviceData.icon;
  if (serviceData.isActive !== undefined) dbData.is_active = serviceData.isActive;
  
  const service = await prisma.service.update({
    where: { id },
    data: dbData
  });
  
  // Convert snake_case to camelCase for API response
  const serviceObj = {
    id: service.id,
    name: service.name,
    displayName: service.display_name,
    description: service.description,
    serviceType: service.service_type,
    icon: service.icon,
    isActive: service.is_active,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt
  };
  
  // Add icon URL if icon exists
  if (service.icon) {
    serviceObj.iconUrl = getImageUrl(service.icon);
  }
  
  return serviceObj;
};

const deleteService = async (id) => {
  return await prisma.service.delete({
    where: { id }
  });
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  getServiceByName,
  updateService,
  deleteService
};