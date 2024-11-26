import React from 'react';
import MapWrapper from '../components/mapWrapper';
import { Button } from "@nextui-org/react";

export default function Page() {
    return (
        <div>
            <h1>Hello, Next.js!</h1>
            <div><Button color="primary">Hello NextUI</Button></div>
            <MapWrapper />
        </div>
    );
  }