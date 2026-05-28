export interface EntraJwtPayload {
  iss: string;
  aud: string | string[];
  exp: number;
  iat: number;
  nbf: number;

  oid: string;
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  emails?: string[];

  scp?: string;
  roles?: string[];

  tid: string;

  amr?: string[];
}
