import React from "react";
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import {
  StyleSheet,
  Image,
  View,
  ImageBackground,
  Dimensions,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Block, Checkbox, Button, Text, theme } from "galio-framework";
import { Input, Icon,  DrawerItem as DrawerCustomItem } from "../components";
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
const { height, width } = Dimensions.get("screen");
import argonTheme from "../constants/Theme";
import Images from "../constants/Images";
import {BACKEND_PATH} from "@env"


const apiClient = axios.create({
  baseURL: BACKEND_PATH ,
  withCredentials: true,
});

class CampaignTarget extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            token:null,
            campaign:null,
            age_start:0,
            age_end:0,
            age_range:[],
            gender:null,
            prefsocials:[],
            objcampaign:null,
            isLoading: false,
            socials:[],
        };
    }

    /* data methods */

    async getToken() {
        await SecureStore.getItemAsync('secure_token').then(t =>{
            this.setState({token:t})
        });
    }

    async getCampaign(campaign) {
        try {
            apiClient.get('campaign/'+campaign, 
            { headers: {Authorization: 'Bearer ' + this.state.token}})
            .then(r => {
                this.setState({objcampaign:r.data, age_range:r.data.age_range, gender:r.data.gender});
                if (r.data.age_range) {
                    this.setState({age_start:r.data.age_range[0],age_end:r.data.age_range[1]});
                }
                if (r.data.socials) {
                    this.setState({prefsocials:r.data.socials})
                }
                this.getSocial();
            }).catch(e => { 
                console.log(e);
            }).finally(()=>{});
        } catch(error) {
            console.log(error);
        };
    
    }

    async getSocial() {
        apiClient.get('user/socials', 
        {headers: {Authorization: 'Bearer ' + this.state.token}}).then(r => {
          console.log(r.data.data.socials);
          this.setState({ 
            socials: r.data.data.socials,
          });
        }).catch(e => { 
          console.log(e);
        }).finally(()=>{})
      }

    async updateCampaign() {
        const { navigation } = this.props;
        this.setState({isLoading: true});
        var id = (this.state.campaign) ? '/'+ this.state.campaign : '';
        apiClient.post('campaign'+id, { 
            age_range:[this.state.age_start, this.state.age_end],
            gender:this.state.gender,
            socials:this.state.prefsocials,
        },
        { headers: {Authorization: 'Bearer ' + this.state.token}})
        .then(r => {
            this.setState({isLoading: false});
            if (r.data.status === 1) {
                navigation.navigate("CampaignAudience", { campaign: r.data.campaign._id });
            } else {
                alert('unsuccessufull');
            }
        })
        .catch(e => { 
            console.log(e);
            this.setState({isLoading: false});
        })
        .finally(()=>{
            this.setState({isLoading: false});
        })
    }

    checkBoxSocial(val) {
        if (this.state.prefsocials.includes(val)){
            this.state.prefsocials.splice(this.state.prefsocials.indexOf(val), 1);
        } else {
            this.state.prefsocials.push(val);
        }
    }

    /* lifecycle */

    shouldComponentUpdate(nextProp, nextState) {
        return true;
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

    componentDidMount() {
        this.getToken();
    }

    /* renderer */

    renderTarget = () => {
    const { age_start, age_end, age_range, isLoading } = this.state;
    return (
        <Block  style={styles.container}>
            <Text style={{marginLeft:14, fontWeight:'500',marginBottom: 0}}>Age range</Text>
            <Block  center style={{margin:20}}>
            <Text style={{marginLeft:14, fontWeight:'200',marginBottom: 0}}>start {age_start}</Text>
            <Slider
                style={{width: width-theme.SIZES.BASE*4, height: 40}}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={(age_range) ? age_range[0] : null}
                onValueChange={(v) => this.setState({age_start:v})}
                minimumTrackTintColor="#cccccc"
                maximumTrackTintColor="#000000"
                />
            <Text style={{marginLeft:14, fontWeight:'200',marginTop: 20}}>end {age_end}</Text>
            <Slider
                style={{width: width-theme.SIZES.BASE*4, height: 40}}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={(age_range) ? age_range[1] : null}
                onValueChange={(v) => this.setState({age_end:v})}
                minimumTrackTintColor="#cccccc"
                maximumTrackTintColor="#000000"
                />
            </Block>
            <Block  style={{marginBottom: 30}}>
                <Text style={{marginLeft:14, fontWeight:'500',marginBottom: 20}}>Gender</Text>
                <SegmentedControl
                    values={['Female', 'Male', 'All']}
                    selectedIndex={this.state.gender}
                    onChange={(event) => {
                        this.setState({gender: event.nativeEvent.selectedSegmentIndex});
                    }}
                />
            </Block>
            
            
        </Block>
        )
    }

    renderSocials= () => {
        const { socials } = this.state;
        return (
            <Block flex style={styles.container}>
            <Text style={{marginLeft:14, fontWeight:'500',marginBottom: 0}}>Socials</Text>
            <Block flex center style={{margin:20}}>
                <ScrollView
                showsVerticalScrollIndicator={true}>
                <Block flex>
                    {socials.length > 0  &&
                    socials.map((item, index) =>
                        this.renderCheckBoxSocial(item, index)
                    )
                    }
                </Block>
                </ScrollView>
            </Block>
            </Block>
        )
    }

      renderCheckBoxSocial = (item, index) => {
        return (
          <Block style={{marginVertical:5,marginHorizontal:30}} key={item._id}>
            <Checkbox
                checkboxStyle={{
                  borderWidth: 3
                }}
                onChange={() => this.checkBoxSocial(item._id)}
                color={argonTheme.COLORS.PRIMARY}
                initialValue={this.state.objcampaign.socials ? this.state.objcampaign.socials.includes(item._id) : null}
                label={item.name}
            />
          </Block>
        )
      }

    render = () => {
    const { isLoading } = this.state;
        return (
            <Block flex style={styles.container}>
                <Block flex space="between" style={styles.padded}>
                    {this.renderTarget()}
                    {this.renderSocials()}
                    <Block center>
                        {isLoading  ? <ActivityIndicator/> : (
                            <LinearGradient colors={['#66FCF1',  '#46BAB8']}
                            style={{borderRadius: 30}} 
                            start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 1.1 }}>
                            <Button
                                style={styles.button}
                                color='transparent'
                                padding='0 0 0 0'
                                onPress={() => this.updateCampaign()}
                                textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
                            >
                                NEXT
                            </Button>
                            </LinearGradient>
                        )}
                </Block>
                </Block>
            </Block>
        );

    }

    /*render() {
        return this.renderPersonal();
    }*/

}

const styles = StyleSheet.create({
  input: {
    borderRadius: 4,
    margin: 0,
    paddingTop:12,
    paddingBottom:12,
    paddingLeft:16,
    paddingRight:16,
    borderColor: argonTheme.COLORS.BORDER,
    backgroundColor: '#F7FAFC'
  },
  inputError: {
    borderRadius: 4,
    margin: 0,
    paddingTop:12,
    paddingBottom:12,
    paddingLeft:16,
    paddingRight:16,
    borderColor: argonTheme.COLORS.BORDER,
    backgroundColor: '#F7FAFC',
    borderWidth:1,
    borderColor: argonTheme.COLORS.INPUT_ERROR,
  },
  container: {
    backgroundColor: theme.COLORS.WHITE
  },
  multiContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    backgroundColor: '#ecf0f1',
  },
  padded: {
    paddingTop:30,
    paddingHorizontal: theme.SIZES.BASE * 2,
    position: "relative",
    bottom: theme.SIZES.BASE,
    zIndex: 2,
  },
  title: {
    marginTop:'10%'
  },
  subCheckbox: {
    paddingLeft: 20
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
    borderRadius: 30,
    marginTop: 0,
    marginBottom: 0,
    marginRight: 0,
    marginLeft: 0,
  },
  logo: {
    width: 79,
    height: 41,
    zIndex: 2,
    position: 'relative',
    marginTop: '30%'
  },
});

export default CampaignTarget;
