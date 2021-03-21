exports.checkAge = (dob) => {
  const dateArr = dob.split("-");
  const today = new Date();
  const DOB = new Date(
    parseInt(dateArr[2]),
    parseInt(dateArr[1]) - 1,
    parseInt(dateArr[0])
  );

  if (DOB > today) {
    return false;
  }

  const diff_ms = Date.now() - DOB.getTime();
  const age_dt = new Date(diff_ms);

  const age = Math.abs(age_dt.getUTCFullYear() - 1970);

  if (age < 18) {
    return false;
  }
  if (age === 18) {
    if (today.getMonth() + 1 < parseInt(dateArr[1])) {
      return false;
    }
    if (today.getMonth() + 1 === parseInt(dateArr[1])) {
      if (today.getDate() <= parseInt(dateArr[0])) {
        return false;
      }
    }
  }
  return true;
};

exports.checkNullString = (str) => {
  if (typeof str === "string" && !str.replace(/\s/g, "").length) {
    return true;
  } else {
    return false;
  }
};

exports.checkPhoneNumber = (phone) => {
  if (phone.length !== 10) {
    return false;
  }
  return true;
};
