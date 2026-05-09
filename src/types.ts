export interface DNSRecord {
  type: 'SPF' | 'DKIM' | 'DMARC';
  domain: string;
  status: 'valid' | 'missing' | 'checking';
  value?: string;
  recommended?: string;
  selector?: string;
}

export interface DomainInfo {
  name: string;
  spf: DNSRecord;
  dkim: DNSRecord;
  dmarc: DNSRecord;
}
