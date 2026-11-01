export interface SingBoxTls {
  [key: string]: unknown;
  enabled?: boolean;
  server_name?: string;
  insecure?: boolean;
  alpn?: string[];
  min_version?: string;
  max_version?: string;
  certificate?: string[];
  certificate_path?: string;
  utls?: { enabled?: boolean; fingerprint?: string };
  reality?: { enabled?: boolean; public_key?: string; short_id?: string };
}
export interface SingBoxTransport {
  [key: string]: unknown;
  type: 'http' | 'ws' | 'quic' | 'grpc' | 'httpupgrade';
  host?: string[];
  path?: string;
  headers?: Record<string, string>;
  service_name?: string;
  max_early_data?: number;
  early_data_header_name?: string;
}
export interface SingBoxOutbound {
  [key: string]: unknown;
  type: string;
  tag?: string;
  server?: string;
  server_port?: number;
  username?: string;
  password?: string;
  version?: number;
  auth_str?: string;
  up_mbps?: number;
  down_mbps?: number;
  obfs?: { type: string; password?: string };
  congestion_control?: string;
  udp_relay_mode?: string;
  idle_session_check_interval?: string;
  idle_session_timeout?: string;
  min_idle_session?: number;
  uuid?: string;
  method?: string;
  security?: string;
  alter_id?: number;
  flow?: string;
  tls?: SingBoxTls;
  transport?: SingBoxTransport;
  outbounds?: string[];
  default?: string;
  url?: string;
  interval?: string;
  detour?: string;
  multiplex?: {
    [key: string]: unknown;
    enabled?: boolean;
    protocol?: string;
    max_connections?: number;
    min_streams?: number;
    max_streams?: number;
    padding?: boolean;
  };
}

export interface SingBoxConfig {
  [key: string]: unknown;
  outbounds?: SingBoxOutbound[];
  route?: { [key: string]: unknown; rules?: SingBoxRule[] };
}

export interface SingBoxRule {
  [key: string]: unknown;
  type?: 'logical';
  mode?: 'and' | 'or';
  rules?: SingBoxRule[];
  outbound?: string;
  rule_set?: string[];
}
