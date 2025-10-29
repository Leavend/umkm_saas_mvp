import Xendit from "xendit-node";

import { env } from "~/env";

const xendit = new Xendit({ secretKey: env.XENDIT_SECRET_KEY });

export const xenditInvoiceClient = xendit.Invoice;
