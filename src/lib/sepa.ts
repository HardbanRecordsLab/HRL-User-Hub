/**
 * Generowanie pliku SEPA Credit Transfer (pain.001.001.03)
 * dla paczki wypłat prowizji artystów.
 */

export type SepaPayment = {
  id: string;
  amount: number;
  currency: string;
  iban: string | null;
  iban_holder: string | null;
  reference: string | null;
};

export type SepaDebtor = {
  name: string;
  iban: string;
  bic?: string;
};

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const clean = (v: string) => v.replace(/\s+/g, "").toUpperCase();

export const isValidIban = (iban?: string | null): boolean => {
  if (!iban) return false;
  const v = clean(iban);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(v)) return false;
  const rearranged = v.slice(4) + v.slice(0, 4);
  const numeric = rearranged
    .split("")
    .map((c) => (/[A-Z]/.test(c) ? (c.charCodeAt(0) - 55).toString() : c))
    .join("");
  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
};

export const buildSepaXml = (payments: SepaPayment[], debtor: SepaDebtor): string => {
  const now = new Date();
  const msgId = `HRL-${now.getTime()}`;
  const execDate = now.toISOString().slice(0, 10);
  const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toFixed(2);

  const txs = payments
    .map(
      (p, idx) => `
        <CdtTrfTxInf>
          <PmtId><EndToEndId>${esc(p.reference || `HRL-${idx + 1}-${p.id.slice(0, 8)}`)}</EndToEndId></PmtId>
          <Amt><InstdAmt Ccy="${esc(p.currency || "PLN")}">${Number(p.amount).toFixed(2)}</InstdAmt></Amt>
          <Cdtr><Nm>${esc(p.iban_holder || "Beneficjent")}</Nm></Cdtr>
          <CdtrAcct><Id><IBAN>${esc(clean(p.iban || ""))}</IBAN></Id></CdtrAcct>
          <RmtInf><Ustrd>${esc(p.reference || "Wyplata prowizji HardbanRecords Lab")}</Ustrd></RmtInf>
        </CdtTrfTxInf>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${esc(msgId)}</MsgId>
      <CreDtTm>${now.toISOString().slice(0, 19)}</CreDtTm>
      <NbOfTxs>${payments.length}</NbOfTxs>
      <CtrlSum>${total}</CtrlSum>
      <InitgPty><Nm>${esc(debtor.name)}</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${esc(msgId)}-1</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <BtchBookg>false</BtchBookg>
      <NbOfTxs>${payments.length}</NbOfTxs>
      <CtrlSum>${total}</CtrlSum>
      <PmtTpInf><SvcLvl><Cd>SEPA</Cd></SvcLvl></PmtTpInf>
      <ReqdExctnDt>${execDate}</ReqdExctnDt>
      <Dbtr><Nm>${esc(debtor.name)}</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>${esc(clean(debtor.iban))}</IBAN></Id></DbtrAcct>
      <DbtrAgt><FinInstnId>${debtor.bic ? `<BIC>${esc(debtor.bic)}</BIC>` : "<Othr><Id>NOTPROVIDED</Id></Othr>"}</FinInstnId></DbtrAgt>
      <ChrgBr>SLEV</ChrgBr>${txs}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
};

export const downloadFile = (content: string, filename: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
