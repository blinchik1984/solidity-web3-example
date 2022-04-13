import React, {Component} from "react";
import factory from "../ethereum/factory";
import {Button, Card} from "semantic-ui-react";
import Layout from "../components/Layout";
import { Link } from '../routes';
import Campaign from "../ethereum/campaign";

class CampaignIndex extends Component {
    static async getInitialProps() {
        const deployedCampaignAddresses = await factory.methods.getDeployedCampaigns().call();
        const campaigns = await Promise.all(
            deployedCampaignAddresses.map((address) => {
                return Campaign(address).methods.getSummary().call();
            })
        );

        return { campaigns };
    }

    renderCampaigns() {
        const items = this.props.campaigns.map(campaign => {
            return {
                header: campaign[6],
                description: (
                    <div>
                        <div>
                            {campaign[5]}
                        </div>
                        <Link route={'/campaigns/' + campaign[7]}>
                            <a>View Campaign</a>
                        </Link>
                    </div>
                ),
                fluid: true,
            }
        });

        return <Card.Group items={items} />
    }

    render() {
        return (
            <Layout>
                <div>
                    <h1>Open Campaigns</h1>
                    <Link route='/campaigns/new'>
                        <a>
                            <Button content="Create Campaign" icon="add circle" primary floated="right" />
                        </a>
                    </Link>
                    {this.renderCampaigns()}
                </div>
            </Layout>
        );
    }
}

export default CampaignIndex;