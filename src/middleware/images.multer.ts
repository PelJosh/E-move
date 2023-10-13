import multer from 'multer';

const storage = multer.diskStorage({});

const upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		if (
			file.mimetype == 'image/png' ||
			file.mimetype == 'image/jpeg' ||
			file.mimetype == 'image/jpg'
		) {
			cb(null, true);
		} else {
			console.log('only jpg , jpeg and png files are supported');
			cb(null, false);
		}
	},
	limits: {
		fileSize: 1024 * 1024 * 2
	}
});

export default upload;
