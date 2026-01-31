const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Helper function untuk membuat direktori jika belum ada
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Pastikan direktori TTE ada
ensureDirectoryExists("uploads/tte/selfie");
ensureDirectoryExists("uploads/tte/surat");
ensureDirectoryExists("uploads/tte/signature");

// Setting penyimpanan untuk profil
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filter file untuk profil (hanya gambar)
const profileFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file .jpeg, .jpg dan .png yang diizinkan"), false);
  }
};

// Setting penyimpanan untuk TTE (foto selfie)
const tteSelfieStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/tte/selfie/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Setting penyimpanan untuk TTE (surat keterangan)
const tteSuratStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/tte/surat/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Setting penyimpanan untuk TTE signature (admin)
const tteSignatureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/tte/signature/");
  },
  filename: (req, file, cb) => {
    cb(null, `signature-${Date.now()}-${file.originalname}`);
  },
});

// Filter file untuk TTE selfie (hanya gambar)
const tteSelfieFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Hanya file gambar .jpeg, .jpg dan .png yang diizinkan"),
      false,
    );
  }
};

// Filter file untuk TTE surat keterangan (PDF dan Word)
const tteSuratFileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file PDF yang diizinkan"), false);
  }
};

// Filter file untuk TTE signature (gambar)
const tteSignatureFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/svg+xml",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diizinkan"), false);
  }
};

const upload = multer({
  storage: profileStorage,
  fileFilter: profileFileFilter,
});

const uploadTTESelfie = multer({
  storage: tteSelfieStorage,
  fileFilter: tteSelfieFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadTTESurat = multer({
  storage: tteSuratStorage,
  fileFilter: tteSuratFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const uploadTTESignature = multer({
  storage: tteSignatureStorage,
  fileFilter: tteSignatureFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware untuk upload multiple files untuk TTE submit
const uploadTTESubmit = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "fotoSelfie") {
        cb(null, "uploads/tte/selfie/");
      } else if (file.fieldname === "suratKeterangan") {
        cb(null, "uploads/tte/surat/");
      }
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "fotoSelfie") {
      if (["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Foto selfie harus JPG/PNG"), false);
      }
    } else if (file.fieldname === "suratKeterangan") {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Surat harus PDF"), false);
      }
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit untuk surat, tapi akan validate di controller
}).fields([
  { name: "fotoSelfie", maxCount: 1 },
  { name: "suratKeterangan", maxCount: 1 },
]);

module.exports = {
  upload,
  uploadTTESelfie,
  uploadTTESurat,
  uploadTTESignature,
  uploadTTESubmit,
};
