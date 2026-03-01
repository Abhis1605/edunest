export const generateCredentials = (shortform, role, count) => {
  const formattedCount = String(count).padStart(2, "0");

  let email = "";
  let password = "";

  if (role === "student") {
    email = `${shortform}${formattedCount}@edunest.com`;
    password = `${shortform}${formattedCount}@edunest`;
  } else if (role === "teacher") {
    email = `${shortform}teacher${formattedCount}@edunest.com`;
    password = `${shortform}teacher${formattedCount}@edunest`;
  } else if (role === 'parent') {
    email = `${shortform}parent${formattedCount}@edunest.com`,
    password = `${shortform}parent${formattedCount}@edunest`
  }

  return { email, password }
};
