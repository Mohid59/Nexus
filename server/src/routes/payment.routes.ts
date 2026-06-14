import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { amountSchema, transferSchema, listTxQuery } from '../validators/payment.schema';
import { getWallet, listTransactions, deposit, withdraw, transfer } from '../controllers/payment.controller';

const router = Router();

router.use(requireAuth);

router.get('/wallet', getWallet);
router.get('/transactions', validate({ query: listTxQuery }), listTransactions);
router.post('/deposit', validate({ body: amountSchema }), deposit);
router.post('/withdraw', validate({ body: amountSchema }), withdraw);
router.post('/transfer', validate({ body: transferSchema }), transfer);

export default router;
