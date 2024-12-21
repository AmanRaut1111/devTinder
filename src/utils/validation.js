const validsignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error(" please provide Input filed");
  }
};

const validateEditProfileData = (req) => {
  try {
    const allowMethods = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "skills",
      "about",
    ];
    const isEditAlowed = Object.keys(req.body).every((field) => {
      return allowMethods.includes(field);
    });
    return isEditAlowed;
  } catch (error) {}
};

module.exports = { validsignupData, validateEditProfileData };
