import multer from "multer";

const allowedAudioTypes = [
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
];

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 25 * 1024 * 1024, // 25 MB
    },

    fileFilter: (req, file, callback) => {
        if (!allowedAudioTypes.includes(file.mimetype)) {
            return callback(
                new Error("Only audio files are allowed")
            );
        }

        return callback(null, true);
    },
});

export default upload;