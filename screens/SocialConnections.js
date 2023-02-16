//galio
import { Block, Text, theme } from "galio-framework";
import {
  Dimensions,
  View,
  Image,
  ImageBackground,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  RefreshControl,
  Platform,
  FlatList,
  Button,
  TouchableOpacity,
  TouchableHighlight,
} from "react-native";
import { SwipeListView } from 'react-native-swipe-list-view';
import { Images, argonTheme, articles } from "../constants/";
import { Card } from "../components/";
import React from "react";
import * as SecureStore from 'expo-secure-store';
import {numberFormat, apiClient} from '../constants/utils'
const { width } = Dimensions.get("screen");
const thumbMeasure = (width - 48 - 32) / 3;
const cardWidth = width - theme.SIZES.BASE * 2;


class SocialConnections extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token:null,
      social:null,
      post_id:null,
      socialname:null,
      socialconnections:null,
      refreshing:false,
      objpost:null,
      objcampaign:null,
    }
  }

  async getToken() {
    await SecureStore.getItemAsync('secure_token').then(t =>{
        this.setState({token:t});
    });
  }

  async getPost(post_id) {
    try {
      await apiClient.get('post/'+post_id, 
      { headers: {Authorization: 'Bearer ' + this.state.token}})
      .then(r => {
        console.log(r.data);
        this.setState({
            objpost:r.data.post,
            objcampaign:r.data.post.campaign
        })
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };
  }

  async getSocialConnection(social) {
    try {
      await apiClient.get('user/socials/'+social+'/connections', 
      { 
        headers: {Authorization: 'Bearer ' + this.state.token}
      }).then(r => {
        let data = r.data.socialconnections;
        console.log(data);
        this.setState({socialconnections:data});
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };
  }

  componentDidUpdate(prevProps, prevState) {
    try {
      const { socialname,  social, post_id } = this.props.route.params
      //Ensuring This is not the first call to the server
      if(social && social !== this.state.social) {
        this.setState({
          social:social,
          post_id:post_id,
          socialname:socialname
        });
        this.getSocialConnection(social); 
        this.getPost(post_id);
      }
    } catch(error) {
      console.log(error);
    };
  }

  shouldComponentUpdate(nextProp, nextState) {
    return true;
  }

  componentDidMount() {
    this.getToken();
  }

  
 

  render() {
    const {socialname, socialconnections, social, post_id, objcampaign, objpost} = this.state;
    const { navigation } = this.props;
    return (
      <Block center>
        {objcampaign && (
        <Block >
            <Block row  style={[styles.card, styles.shadow]}>
                  
                    <Block flex style={[styles.imageContainer]}>
                      <Image source={{uri:objcampaign.cover_url}} style={styles.avatar} />
                    </Block>
          
                    <Block flex={3} ver space="between" style={styles.cardDescription}>
                      <Text size={14} >Enrolled campaign:</Text>
                      <Text size={14} bold>{objcampaign.name}</Text>
                      <Text size={14} >bound posts: {objpost.publications.length}</Text>
                    </Block>

            </Block>
        </Block>
        )}
        <Block flex={8}>
        <Text center size={14} style={styles.title} bold >Social connections for: {socialname}</Text>
        <FlatList
            data={socialconnections}
            renderItem={({item, index, separators}) => (
              <Block row flex style={[styles.card, styles.shadow]} key={item._id}>
              <TouchableWithoutFeedback onPress={() => navigation.navigate('Publications',{connection:item._id, post_id:post_id})}>
                <Block flex style={[styles.imageContainer]}>
                  <Image source={{uri:item.token.avatar}} style={styles.avatar} />
                </Block>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => navigation.navigate('Publications',{connection:item._id, post_id:post_id})}>
                <Block flex={3} ver space="between" style={styles.cardDescription}>
                  <Text size={14} >Social connection:</Text>
                  <Text size={14} style={styles.cardTitle} bold>{item.token.name}</Text>
                </Block>
              </TouchableWithoutFeedback>
            </Block>
            )}
            refreshing={false}
            onRefresh={() => this.getSocialConnection(social)}
        />
        </Block>
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
  rowBack: {
    alignItems: 'center',   
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 16,
    justifyContent: 'center',
    position: 'absolute',
    top: 16,
    width: 75,
    borderRadius: 10
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
  backTextWhite: {
    color: '#FFF',
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
    width: 62,
    height: 62,
    borderRadius: 30,
    borderWidth: 0,
    marginVertical:5,
    marginHorizontal:5
  },
});

export default SocialConnections;
