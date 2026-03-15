import User from "../models/User.model.js";
import Learner from "../models/Learner.model.js";
import Institute from "../models/Institute.model.js";
import Employer from "../models/Employer.model.js";

const modelByRole = {
  admin: User,
  learner: Learner,
  institute: Institute,
  employer: Employer,
};

const roleModels = Object.values(modelByRole);

const getModelForRole = (role) => modelByRole[role] || null;

const findUserByIdAcrossRoles = async (id, select = "") => {
  for (const model of roleModels) {
    const query = model.findById(id);
    if (select) query.select(select);
    const doc = await query;
    if (doc) return doc;
  }
  return null;
};

const findUserByEmailAcrossRoles = async (email, select = "") => {
  for (const model of roleModels) {
    const query = model.findOne({ email });
    if (select) query.select(select);
    const doc = await query;
    if (doc) return doc;
  }
  return null;
};

const findUserByRefreshToken = async (refreshToken, select = "") => {
  for (const model of roleModels) {
    const query = model.findOne({ refreshToken });
    if (select) query.select(select);
    const doc = await query;
    if (doc) return doc;
  }
  return null;
};

const emailExistsAcrossRoles = async (email) => {
  for (const model of roleModels) {
    const existing = await model.exists({ email });
    if (existing) return true;
  }
  return false;
};

const getAllRoleModels = () => roleModels;

export {
  emailExistsAcrossRoles,
  findUserByEmailAcrossRoles,
  findUserByIdAcrossRoles,
  findUserByRefreshToken,
  getAllRoleModels,
  getModelForRole,
};
