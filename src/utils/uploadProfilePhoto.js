require("dotenv").config();

module.exports = async function (imgBase64) {
  const formData = new FormData();
  formData.append("file", imgBase64);
  formData.append("upload_preset", "default-preset");

  try {
    const res = await fetch(process.env.UPLOAD_IMG_API, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("The image could not be uploaded, please try again");
    }
    const jsonRes = await res.json();
    return jsonRes.url;
  } catch (error) {
    throw error;
  }
};
