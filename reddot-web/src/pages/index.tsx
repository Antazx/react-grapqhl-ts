import { withUrqlClient } from "next-urql";
import React from "react";
import { NavBar } from "../components/NavBar";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
    const [] = 
    return (
        <>
            <NavBar></NavBar>
            <div>Hello world</div>
        </>
    );
};

export default withUrqlClient(createUrqlClient)(Index);
