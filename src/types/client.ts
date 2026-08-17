export type ClientInput = {
  brn: string;
  companyName: string;
  email: string;
  name: string;
  nationalId: string;
  phone: string;
};

export type Client = ClientInput & {
  createdAt: number;
  id: string;
};
