'use client';

import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

const Login: React.FC = () => {
    const { data: session, status } = useSession();
    const loading = status === 'loading';

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            {!session ? (
                <button onClick={() => signIn()}>登入</button>
            ) : (
                <>
                    <p>使用者 email: {session.user?.email}</p>
                    <button onClick={() => signOut()}>登出</button>
                </>
            )}
        </div>
    );
};

export default Login;
