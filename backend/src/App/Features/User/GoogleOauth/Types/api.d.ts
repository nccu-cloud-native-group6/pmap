declare namespace GoogleOauth {
  type TAsRequestBody = {
    code: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    grant_type: string;
  };
  interface IGoogleOauthResponse {
    data: {
      accessToken: string;
      accessExpired: string;
      userId: number;
    };
  }
}
