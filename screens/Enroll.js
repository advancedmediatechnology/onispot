import React from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

import * as Sharing from "expo-sharing";
import { Video, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Image, Dimensions, ScrollView, View, RefreshControl } from 'react-native';
import { Icon } from "../components";
import { Button, Block, Text, theme } from 'galio-framework';
import {numberFormat, apiClient} from '../constants/utils'
import argonTheme from "../constants/Theme";
const { width } = Dimensions.get('screen');
const cardWidth = width - theme.SIZES.BASE * 2;

class Enroll extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token:null,
      campaign:null,
      objcampaign:null,
      objuser:null,
    }
  }

  async getUser() {
    await apiClient.post('user', 
    { },
    { headers: {Authorization: 'Bearer ' + this.state.token}}).then(r => {
      console.log(r.data);
      this.setState({ 
        objuser:r.data
      });
    }).catch(e => { 
      console.log(e);
    }).finally(()=>{})
  }

  async getCampaign(campaign) {
    try {
      await apiClient.get('campaign/'+campaign, 
      { },
      { headers: {Authorization: 'Bearer ' + this.state.token}})
      .then(r => {
        let cover = r.data.cover_url ? {uri:r.data.cover_url} : null;
        console.log(r.data);
        this.setState({
          objcampaign:r.data
        })
      }).catch(e => { 
        console.log(e);
      }).finally(()=>{});
    } catch(error) {
        console.log(error);
    };
  }

  async enroll(campaign) {
    try {
      await apiClient.patch('user/enroll', 
      { campaign_id:campaign },
      { headers: {Authorization: 'Bearer ' + this.state.token}})
      .then(r => {
        console.log(r.data);
        this.setState({
          objuser:r.data
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
          this.getCampaign(campaign); // Get the new Project when project id Change on Url
      }
      } catch(error) {
      console.log(error);
      };
  }

  getCreativity = () => {
   
    switch (this.state.objcampaign.type) {
      case 0:
        this.downloadFile();
        break;
      case 1:
        this.downloadFile();
        break
      case 3:
        this.downloadFile();
        break
      default:
        this.downloadFile();
        break;
    }
  }

  downloadFile = async () => {
      const uri = this.state.objcampaign.file_url;
      let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
      let fileUri = FileSystem.documentDirectory + filename;
      console.log(filename);
      await FileSystem.downloadAsync(uri, fileUri)
      .then(({ uri }) => {
          if (this.state.objcampaign.type ===  3) {
            this.saveFileToDocument(uri);
          } else {
            this.saveFile(uri);
          }
      })
      .catch(error => {
          console.error(error);
      })
  }

  saveFile = async (fileUri) => {
      await MediaLibrary.requestPermissionsAsync().then(permissionResult => {
          if (permissionResult.granted === false) {
            alert("You've refused to allow this appp to access your photos!");
            return;
          } 
          MediaLibrary.createAssetAsync(fileUri).then(asset =>{
            MediaLibrary.createAlbumAsync("Onispot/"+this.state.objcampaign.name, asset, false).then(() => {
              alert('Creativity saved on media album: Onispot/'+this.state.objcampaign.name);
              this.enroll(this.state.campaign)
            });
          })
      });
  }

  saveFileToDocument = async (fileUri) => {
    const UTI = 'public.item';
    await Sharing.shareAsync(fileUri, {UTI}).then(()=>{
      alert('Creativity saved in Files');
      this.enroll(this.state.campaign)
    });
  }

  shouldComponentUpdate(nextProp, nextState) {
      return true;
  }

  componentDidMount() {
      this.getToken();
  }

  renderArticles = () => {
    const { objcampaign } = this.state;
    const { navigation } = this.props;
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.articles}
      >
        <Block flex>
          <Text style={styles.titleHead} bold size={16}>Campaign to enroll</Text>
        </Block>  
        {objcampaign && (
            <Block >
              <Block row  style={[styles.card, styles.shadow]}>
                  <Block flex style={[styles.imageContainer]}>
                    <Image source={{uri:objcampaign.cover_url}} style={styles.avatar} />
                  </Block>
                  <Block flex={2} ver space="between" style={styles.cardDescription}>
                    <Text size={14} bold>{objcampaign.name}</Text>
                    <Text size={14} >{objcampaign.description}</Text>
                    <Text size={14} >Budget: {numberFormat(objcampaign.budget)}</Text>
                  </Block>
              </Block>
              <Block flex>
                <Text style={styles.titleHead} bold size={16}>Creativity</Text>
                <Text style={styles.titleHead}  size={12}>Enrolling this campaign, the caption will be copied to your clipboard, the photo or video will be downloaded to your device's media library, the filter will be downloaded to a location of your choosing.</Text>
              </Block>
              <View
                  style={{
                    borderBottomColor: 'black',
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    marginVertical:20
                  }}
                /> 
              <Block center>
              <Text
                    size={14}
                    color={theme.COLORS.MUTED}
                    style={styles.label}
                  >
                    Caption
                  </Text>
                <Text
                  size={16}
                  color={theme.COLORS.BLACK}
                  style={styles.productDescription}
                >
                  {objcampaign.content}
                </Text>
              </Block>
              {objcampaign.type === 3 && (
                <Block center>
                  <Text
                    size={14}
                    color={theme.COLORS.MUTED}
                    style={styles.label}
                  >
                    Filter
                  </Text>
                  <Icon family="Foundation"
                    size={50}
                    name={'paint-bucket'}>
                  </Icon>
                </Block>
              )}
              {objcampaign.type === 0 && (
                <Block center>
                  <Text
                    size={14}
                    color={theme.COLORS.MUTED}
                    style={styles.label}
                  >
                    Photo
                  </Text>
                  <Image
                    style={styles.productImage}
                    source={{ uri: objcampaign.file_url }}  
                  ></Image>
                </Block>
              )}
              {objcampaign.type === 1 && (
                <Block center>
                  <Text
                    size={14}
                    color={theme.COLORS.MUTED}
                    style={styles.label}
                  >
                    Video
                  </Text>
                  <Video
                    style={styles.video}
                    source={{
                      uri: objcampaign.file_url,
                    }}
                    useNativeControls
                  
                  ></Video>
                </Block>
              )}
              <Block center>
              <LinearGradient 
                    colors={['#66FCF1',  '#46BAB8']}
                    style={{borderRadius: 30, marginTop: 30}} 
                    start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 1.1 }}>
                  <Button
                      style={styles.button}
                      color='transparent'
                      padding='0 0 0 0'
                      onPress={() => this.getCreativity()}
                      textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
                  >
                      ENROLL
                  </Button>
              </LinearGradient>
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
    paddingLeft: 10,
    marginTop: 5,
    color: argonTheme.COLORS.HEADER,
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
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
  productItem: {
    width: cardWidth - theme.SIZES.BASE * 2,
    marginHorizontal: theme.SIZES.BASE,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
    shadowOpacity: 0.2,
  },
  productImage: {
    width: 150,//cardWidth - theme.SIZES.BASE,
    height: 150, //cardWidth - theme.SIZES.BASE,
    borderRadius: 3,
  },
  productPrice: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
  },
  productDescription: {
    //paddingTop: theme.SIZES.BASE,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 0,
    marginVertical:5,
    marginHorizontal:5
  },
  label: {
    marginVertical:4
  },
});

export default Enroll;
