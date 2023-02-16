//galio
import { Block, Text, theme } from "galio-framework";
import {
  Dimensions,
  View,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  RefreshControl,
  Platform,
  FlatList,
  Button
} from "react-native";

import { Images, argonTheme, articles } from "../constants/";
import { Card } from "../components/";
import React from "react";
import * as SecureStore from 'expo-secure-store';
import {numberFormat, apiClient} from '../constants/utils'
const { width } = Dimensions.get("screen");

const thumbMeasure = (width - 48 - 32) / 3;
const cardWidth = width - theme.SIZES.BASE * 2;


class Articles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token:null,
      campaigns:null,
      refreshing:false,
    }
    this.getToken();
  }

  async getToken() {
    await SecureStore.getItemAsync('secure_token').then(t =>{
        this.setState({token:t});
        this.getCampaigns();
    });
  }

  async getCampaigns() {
    try {
      apiClient.post('campaign/my', 
      { },
      { headers: {Authorization: 'Bearer ' + this.state.token}})
      .then(r => {
        let data = r.data;
        if (this.state.campaigns !== data) {
          let i = 0;
          data.forEach(function (element) {
              element.key = i++;
          });
          this.setState({campaigns:data});
        }
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };
  }

  renderCard = (item, index) => {
    const { navigation } = this.props;
    return (
        <Card style={{width: cardWidth}} item={item} key={item._id} horizontal />
    );
  };

  render() {
    const {campaigns} = this.state;
    return (
      <Block flex center>
        <FlatList
            data={campaigns}
            renderItem={({item, index, separators}) => (
                this.renderCard(item, index)
            )}
            refreshing={false}
            onRefresh={() => this.getCampaigns()}
        />
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    paddingBottom: theme.SIZES.BASE,
    paddingHorizontal: theme.SIZES.BASE * 2,
    marginTop: 22,
    color: argonTheme.COLORS.HEADER,
  },
  titleHead: {
    paddingBottom: theme.SIZES.BASE,
    paddingLeft: 22,
    marginTop: 22,
    color: argonTheme.COLORS.HEADER,
  },
  group: {
    paddingTop: theme.SIZES.BASE,
  },
  albumThumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure,
  },
  category: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE / 2,
    borderWidth: 0,
  },
  categoryTitle: {
    height: "100%",
    paddingHorizontal: theme.SIZES.BASE,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageBlock: {
    overflow: "hidden",
    borderRadius: 4,
  },
  productItem: {
    width: cardWidth - theme.SIZES.BASE * 2,
    marginHorizontal: theme.SIZES.BASE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
    shadowOpacity: 0.2,
  },
  productImage: {
    width: cardWidth - theme.SIZES.BASE,
    height: cardWidth - theme.SIZES.BASE,
    borderRadius: 3,
  },
  productPrice: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
  },
  productDescription: {
    paddingTop: theme.SIZES.BASE,
    // paddingBottom: theme.SIZES.BASE * 2,
  },
});

export default Articles;
