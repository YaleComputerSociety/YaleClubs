import { ReactNode } from 'react';

type AuthWrapperProps = {
  children: ReactNode;
};

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  return <>{children}</>;
};

export default AuthWrapper;
