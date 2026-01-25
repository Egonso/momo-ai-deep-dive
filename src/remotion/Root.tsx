import React from 'react';
import { Composition } from 'remotion';

export const MyComposition: React.FC = () => {
    return (
        <div
            style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '7em',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            Welcome to Remotion
        </div>
    );
};

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="MyComp"
                component={MyComposition}
                durationInFrames={60}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
