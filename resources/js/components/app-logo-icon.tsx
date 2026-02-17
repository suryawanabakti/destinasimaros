import { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logomaros.png"
            alt="Logo"
            {...props}
        />
    );
}
