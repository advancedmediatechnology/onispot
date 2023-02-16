import React from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

import * as Sharing from "expo-sharing";
import { Video, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Image, Dimensions, ScrollView, TouchableWithoutFeedback, RefreshControl } from 'react-native';
import { Icon } from "../components";
import { Card } from "../components/";
import { Button, Block, Text, theme } from 'galio-framework';
import {numberFormat, apiClient} from '../constants/utils'
import argonTheme from "../constants/Theme";
const { width } = Dimensions.get('screen');
const cardWidth = width - theme.SIZES.BASE * 2;

Object.prototype.hasOwnProperty = function(property) {
  return this[property] !== undefined;
};

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token:null,
      campaign:null,
      objpost:null,
      objcampaign:null,
      objuser:null,
    }
  }

  async getUser() {
    await apiClient.post('user', 
    { },
    { headers: {Authorization: 'Bearer ' + this.state.token}}).then(r => {
      this.setState({ 
        objuser:r.data
      });
    }).catch(e => { 
      console.log(e);
    }).finally(()=>{})
  }

  async getPost(campaign) {
    try {
      await apiClient.get('post/'+campaign, 
      { headers: {Authorization: 'Bearer ' + this.state.token}})
      .then(r => {
        console.log(r.data.post.publications);
        this.setState({
            objpost:r.data.post.publications,
            objcampaign:r.data.post.campaign
        })
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };
  }

  async getToken() {
      await SecureStore.getItemAsync('secure_token').then(t =>{
          this.setState({token:t});
          this.getUser();
      });
  }

  

  componentDidUpdate(prevProps, prevState) {
      try {
      const { campaign } = this.props.route.params
      //Ensuring This is not the first call to the server
      if(campaign && campaign !== this.state.campaign) {
          this.setState({campaign:campaign});
          this.getPost(campaign); // Get the new Project when project id Change on Url
      }
      } catch(error) {
      console.log(error);
      };
  }

  checkPublications(publications, social) {
    var status = false;
    publications.forEach(function (item, index) {
      if (item.socialconnection.social_id === social){status = true}
    });
    return status
  }

  shouldComponentUpdate(nextProp, nextState) {
      return true;
  }

  componentDidMount() {
      this.getToken();
  }

  renderArticles = () => {
    const { objpost, objcampaign, campaign } = this.state;
    const { navigation } = this.props;
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.articles}
      >
        {objpost && (
            <Block center>
            
            <Block center style={{ paddingHorizontal: theme.SIZES.BASE }}>
            <Block row flex style={[styles.card, styles.shadow]}>
                  
                    <Block flex style={[styles.imageContainer]}>
                      <Image source={{uri:objcampaign.cover_url}} style={styles.avatar} />
                    </Block>
          
                    <Block flex={3} ver space="between" style={styles.cardDescription}>
                      <Text size={14} >Enrolled campaign:</Text>
                      <Text size={14}  bold>{objcampaign.name}</Text>
                      <Text size={14} >bound posts: {objpost.length}</Text>
                    </Block>

            </Block>
              <Text center
                size={14} style={styles.title} bold >
                Select social connection:
              </Text>
              
              {objcampaign.campaign_socials && objcampaign.campaign_socials.map((item, index) => 
              <LinearGradient 
                    key={item._id}
                    colors={['#66FCF1',  '#46BAB8']}
                    style={{borderRadius: 30, marginTop: 30}} 
                    start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 1.1 }}>
                  <Button
                      style={styles.button}
                      color='transparent'
                      padding='0 0 0 0'
                      onPress={() => navigation.navigate("SocialConnection", { socialname: item.name, social: item._id, post_id: campaign  })}
                      textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
                  >
                     <Text size={16} style={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}>{item.name} {this.checkPublications(objpost,item._id) ? 
                     (<Icon name="check"
                            family="Entypo" 
                            size={20} 
                            color={argonTheme.COLORS.WHITE}
                            style={{marginTop:10}}
                            />) : ''}</Text>
                      
                  </Button>
              </LinearGradient>
              
              )}
                
            </Block>
          </Block>
        )}
        
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
  titleHead: {
    paddingBottom: theme.SIZES.BASE,
    paddingLeft: 10,
    marginTop: 5,
    color: argonTheme.COLORS.HEADER,
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    /*paddingVertical: theme.SIZES.BASE,*/
  },
  imageBlock: {
    overflow: "hidden",
    borderRadius: 4,
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
    borderRadius: 30,
    borderWidth: 0,
    marginTop: 0,
    marginBottom: 0,
    marginRight: 0,
    marginLeft: 0,
  },
  title: {
    paddingBottom: theme.SIZES.BASE,
    paddingHorizontal: theme.SIZES.BASE * 2,
    marginTop: 22,
    color: argonTheme.COLORS.HEADER,
  },
  productImage: {
    width: 54,//cardWidth - theme.SIZES.BASE,
    height: 54, //cardWidth - theme.SIZES.BASE,
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
  video: {
    alignSelf: 'center',
    width: 320,
    height: 200,
  },
  card: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: 10,
    borderWidth: 0,
    width:cardWidth,
    borderRadius: 10,

  },
  cardTitle: {
    flex: 1,
    flexWrap: 'wrap',
    paddingBottom: 6
    
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2
  },
  imageContainer: {
    borderRadius: 3,
    elevation: 1,
    overflow: 'hidden',
 
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginTop: -80
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 0,
    marginVertical:5,
    marginHorizontal:5
  },
});

export default Post;
