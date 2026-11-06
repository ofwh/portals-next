import type { AnyTLSNodeFields } from './protocols/anytls';
import type { EasytierNodeFields } from './protocols/easytier';
import type { GostRelayNodeFields } from './protocols/gost-relay';
import type { HTTPNodeFields } from './protocols/http';
import type { HTTPSNodeFields } from './protocols/https';
import type { HysteriaNodeFields } from './protocols/hysteria';
import type { Hysteria2NodeFields } from './protocols/hysteria2';
import type { MasqueNodeFields } from './protocols/masque';
import type { MieruNodeFields } from './protocols/mieru';
import type { NaiveNodeFields } from './protocols/naive';
import type { OpenVPNNodeFields } from './protocols/openvpn';
import type { ShadowquicNodeFields } from './protocols/shadowquic';
import type { SnellNodeFields } from './protocols/snell';
import type { SOCKS5NodeFields } from './protocols/socks5';
import type { SSNodeFields } from './protocols/ss';
import type { SSHNodeFields } from './protocols/ssh';
import type { SSRNodeFields } from './protocols/ssr';
import type { SudokuNodeFields } from './protocols/sudoku';
import type { TailscaleNodeFields } from './protocols/tailscale';
import type { TrojanNodeFields } from './protocols/trojan';
import type { TrusttunnelNodeFields } from './protocols/trusttunnel';
import type { TUICNodeFields } from './protocols/tuic';
import type { VLESSNodeFields } from './protocols/vless';
import type { VMessNodeFields } from './protocols/vmess';
import type { WireGuardNodeFields } from './protocols/wireguard';
import type { ZerotierNodeFields } from './protocols/zerotier';

export type ProxyNodeFields =
  | AnyTLSNodeFields
  | EasytierNodeFields
  | GostRelayNodeFields
  | HTTPNodeFields
  | HysteriaNodeFields
  | Hysteria2NodeFields
  | MasqueNodeFields
  | MieruNodeFields
  | OpenVPNNodeFields
  | ShadowquicNodeFields
  | SnellNodeFields
  | SOCKS5NodeFields
  | SSNodeFields
  | SSHNodeFields
  | SSRNodeFields
  | SudokuNodeFields
  | TailscaleNodeFields
  | TrojanNodeFields
  | TrusttunnelNodeFields
  | TUICNodeFields
  | VLESSNodeFields
  | VMessNodeFields
  | WireGuardNodeFields
  | ZerotierNodeFields
  | HTTPSNodeFields
  | NaiveNodeFields;

export type { ProxyType } from './common';
