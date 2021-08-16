export interface IUserData {
  id: string;
  firstName: string;
  secondName: string;
  email: string;
}

export interface IUserRO {
  user: IUserData;
}
