import React from 'react';
import { StyleSheet, Image, Dimensions, ScrollView, TouchableWithoutFeedback, RefreshControl } from 'react-native';
import equal from 'fast-deep-equal'
import { Button, Block, Text, theme } from 'galio-framework';
import { Card } from '../components';
import { argonTheme, Images } from '../constants';
import {numberFormat, apiClient} from '../constants/utils'
const { width } = Dimensions.get('screen');
const cardWidth = width - theme.SIZES.BASE * 2;
const thumbMeasure = (width - 48 - 32) / 3;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token:null,
      campaigns:null,
      searchkey:null
    }
    this.getCampaigns();
  }

  async getCampaigns() {
    try {
      await apiClient.get('campaign/', 
      { },
      { headers: {Authorization: 'Bearer ' + this.state.token}})
      .then(r => {
        let data = r.data;
        if (this.state.campaigns !== data) {
          this.setState({campaigns:r.data});
        }
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };
  }

  async getCampaignsBySearch(searchkey) {
    try {
      await apiClient.get('campaign/search', 
      { 
        headers: {Authorization: 'Bearer ' + this.state.token},
        params: {searchkey}
      }).then(r => {
        let data = r.data;
        if (this.state.campaigns !== data) {
          this.setState({campaigns:r.data});
        }
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };
  }

  componentDidUpdate(prevProps) {
    if(!equal(this.props.route, prevProps.route)) 
    {
      this.updateCampaign();
    }
  } 

  shouldComponentUpdate(nextProp, nextState) {
    return true;
  }

  updateCampaign() {
    const {searchkey} = this.props.route.params
    console.log(searchkey);
    this.getCampaignsBySearch(searchkey);
  }

  renderArticles = () => {
    const {campaigns} = this.state;
    const { navigation } = this.props;
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.articles}
        refreshControl = {<RefreshControl refreshing={false} onRefresh={() => this.getCampaigns()} />}
      >
        <Block flex>
          <Text style={styles.titleHead} bold size={16}>Campaigns to enroll</Text>
          <ScrollView
                horizontal={true}
                pagingEnabled={true}
                decelerationRate={0}
                scrollEventThrottle={16}
                snapToAlignment="center"
                showsHorizontalScrollIndicator={false}
                snapToInterval={cardWidth + theme.SIZES.BASE * 0.375}
                contentContainerStyle={{
                  paddingHorizontal: theme.SIZES.BASE / 2,
                }}
            >
                {campaigns &&
                  campaigns.map((item, index) =>
                    this.renderProduct(item, index)
                  )}
            </ScrollView>
            {this.renderAlbum()}
        </Block>
      </ScrollView>
    );
  }

  renderAlbum = () => {
    const { navigation } = this.props;
    return (
      <Block
        flex
        style={[styles.group, { paddingBottom: theme.SIZES.BASE * 5, marginHorizontal:14}]}
      >
        <Text bold size={16} style={styles.title}>
          Album
        </Text>
        <Block style={{ backgroundColor: 'trasparent' }}>
          <Block flex right>
            <Text
              size={12}
              color={theme.COLORS.PRIMARY}
              onPress={() => navigation.navigate("Home")}
            >
              View All
            </Text>
          </Block>
          <Block 
            row
            space="between"
            style={{ marginTop: theme.SIZES.BASE, flexWrap: "wrap" }}
          >
            {Images.Viewed.map((img, index) => (
              <Block key={`viewed-${img}`} style={styles.shadow}>
                <Image
                  resizeMode="cover"
                  source={{ uri: img }}
                  style={styles.albumThumb}
                />
              </Block>
            ))}
          </Block>
        </Block>
      </Block>
    );
  };

  renderProduct = (item, index) => {
    const { navigation } = this.props;
    return (
      <TouchableWithoutFeedback
        style={{ zIndex: 3 }}
        key={item._id}
        onPress={() => navigation.navigate("Enrollcampaign", { campaign: item._id })}
      >
        <Block center style={styles.productItem}>
          <Image
            resizeMode="cover"
            style={styles.productImage}
            source={{ uri: item.cover_url }}
          />
          <Block center style={{ paddingHorizontal: theme.SIZES.BASE }}>
            <Text
              center
              size={16}
              color={theme.COLORS.MUTED}
              style={styles.productPrice}
            >
              {numberFormat(item.budget)}
            </Text>
            <Text center size={34}>
              {item.name}
            </Text>
            <Text
              center
              size={16}
              color={theme.COLORS.MUTED}
              style={styles.productDescription}
            >
              {item.description}
            </Text>
          </Block>
        </Block>
      </TouchableWithoutFeedback>
    );
  };

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
  group: {
    paddingTop: theme.SIZES.BASE,
  },
  titleHead: {
    paddingBottom: theme.SIZES.BASE,
    paddingLeft: 10,
    marginTop: 5,
    color: argonTheme.COLORS.HEADER,
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
  albumThumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: "center",
    width: thumbMeasure,
    height: thumbMeasure,
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

export default Home;
