import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { docIdParam, signSchema, shareSchema } from '../validators/document.schema';
import {
  uploadDocument,
  listDocuments,
  getDocument,
  downloadFile,
  signDocument,
  shareDocument,
  deleteDocument,
} from '../controllers/document.controller';

const router = Router();

router.use(requireAuth);

router.get('/', listDocuments);
router.post('/', upload.single('file'), uploadDocument);
router.get('/:id', validate({ params: docIdParam }), getDocument);
router.get('/:id/file', validate({ params: docIdParam }), downloadFile);
router.post('/:id/sign', validate({ params: docIdParam, body: signSchema }), signDocument);
router.post('/:id/share', validate({ params: docIdParam, body: shareSchema }), shareDocument);
router.delete('/:id', validate({ params: docIdParam }), deleteDocument);

export default router;
