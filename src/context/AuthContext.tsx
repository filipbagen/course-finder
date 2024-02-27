// import React, {
//   createContext,
//   useContext,
//   ReactNode,
//   FunctionComponent,
// } from 'react';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../firebase';

// // Define the context's value type
// interface IAuthContext {
//   createUser: (email: string, password: string) => Promise<void>;
// }

// // Create context with an initial undefined value, correctly typed
// const UserContext = createContext<IAuthContext | undefined>(undefined);

// // Type for the props of AuthContextProvider
// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthContextProvider: FunctionComponent<AuthProviderProps> = ({
//   children,
// }) => {
//   const createUser = (email: string, password: string) => {
//     return createUserWithEmailAndPassword(auth, email, password);
//   };

//   // Provide a properly typed value object to the Provider
//   return (
//     <UserContext.Provider value={{ createUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// // Custom hook to use the auth context
// export const UserAuth = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     // This ensures that the hook is used within a component that's wrapped by the AuthContextProvider
//     throw new Error('useAuth must be used within an AuthContextProvider');
//   }
//   return context;
// };

// test
import React from 'react';
import { User } from 'firebase/auth';

export const AuthContext = React.createContext<User | null>(null);
