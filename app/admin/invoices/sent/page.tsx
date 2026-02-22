'use client'
import { DocumentList } from '../../_components/DocumentList'
export default function InvoicesSentPage() {
  return <DocumentList type="invoice" title="Sent Invoices" createHref="/admin/invoices" createLabel="New Invoice" />
}
