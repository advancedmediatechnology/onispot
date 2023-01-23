import React from 'react';
import axios from 'axios';
import { StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Button, Block, Text, theme } from 'galio-framework';

import { Card } from '../components';
import articles from '../constants/articles';
import argonTheme from "../constants/Theme";
const { width } = Dimensions.get('screen');

const apiClient = axios.create({
  baseURL: 'http://test.onispot.com/api/' ,
  withCredentials: true,
});

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token:null,
      campaigns:null,
    }
  }

  async getCampaign() {
    try {
      apiClient.get('campaign/', 
      { },
      { headers: {Authorization: 'Bearer ' + this.state.token}})
      .then(r => {
        this.setState({campaigns:r.data})
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };
  
  }

  componentDidMount() {
    this.getCampaign();
  }

  renderArticles = () => {
    const {campaigns} = this.state;
    const { navigation } = this.props;
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.articles}
      >
        <Block flex>
          {campaigns &&
            campaigns.map((item, index) => (
              <Block
                style={{ marginVertical: 5, marginHorizontal: 30 }}
                key={item._id}
              >
                <Button
                  onPress={() =>
                    navigation.navigate("Newcampaign", { campaign: item._id })
                  }
                  color={argonTheme.COLORS.PRIMARY}
                />
                <Text>{item.name}</Text>
              </Block>
            ))}
          <Button
            onPress={() =>
              navigation.navigate("CheckoutForm", { })
            }
          >
            <Text>Stripe</Text>
          </Button>
          <Card item={articles[0]} horizontal />
          <Block flex row>
            <Card
              item={articles[1]}
              style={{ marginRight: theme.SIZES.BASE }}
            />
            <Card item={articles[2]} />
          </Block>
          <Card item={articles[3]} horizontal />
          <Card item={articles[4]} full />
        </Block>
      </ScrollView>
    );
  }

  render() {
    return (
      <Block flex center style={styles.home}>
        {this.renderArticles()}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,    
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
});

export default Home;
