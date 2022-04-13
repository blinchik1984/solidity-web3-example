import React, {Component} from "react";
import Header from "./Header";
import {Container} from "semantic-ui-react";
import {Head} from "next/document";

class Layout extends Component {
    render() {
        return (
            <Container>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css"/>
                <Header />
                {this.props.children}
            </Container>
        );
    }
}

export default Layout;