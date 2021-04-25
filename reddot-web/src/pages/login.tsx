import React from "react";
import { Formik, Form } from "formik";
import { Button, Box } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputFields";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/dist/client/router";

interface registerProps {}

export const Login: React.FC<registerProps> = ({}) => {
    const router = useRouter();
    const [, login] = useLoginMutation();
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ username: "", password: "" }}
                onSubmit={async (values, {setErrors}) => {
                    const response = await login({options: {username: values.username, password: values.password}});
                    if(response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors));
                    } else if (response.data?.login.user){
                        console.log("user logged");
                        router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField name="username" placeholder="Username" label="Username"/>
                        <Box mt={4}>
                        <InputField name="password" placeholder="Password" label="Password" type="password"/>
                        </Box>
                        <Button my={4} isLoading={isSubmitting} type="submit">Register</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default Login;
