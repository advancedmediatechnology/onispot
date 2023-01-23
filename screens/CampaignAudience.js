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



const apiClient = axios.create({
  baseURL: 'http://test.onispot.com/api/' ,
  withCredentials: true,
});

class CampaignAudience extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            token:null,
            campaign:null,
            budget:null,
            audience:null,
            errorbudget:false,
            objcampaign:null,
            isLoading: false,
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
            { },
            { headers: {Authorization: 'Bearer ' + this.state.token}})
            .then(r => {
                this.setState({objcampaign:r.data, budget:r.data.budget});
                this.getAudience(campaign)
            }).catch(e => { 
                console.log(e);
            }).finally(()=>{});
        } catch(error) {
            console.log(error);
        };
    }

    async updateCampaign() {
        const { navigation } = this.props;
        this.setState({isLoading: true});
        var id = (this.state.campaign) ? '/'+ this.state.campaign : '';
        apiClient.post('campaign'+id, { 
            budget:this.state.budget,
        },
        { headers: {Authorization: 'Bearer ' + this.state.token}})
        .then(r => {
            this.setState({isLoading: false});
            if (r.data.status === 1) {
                console.log(r.data);
                this.getAudience(this.state.campaign)
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

    async getAudience() {
        try {
            apiClient.get('campaign/'+this.state.campaign+'/audience', 
            { },
            { headers: {Authorization: 'Bearer ' + this.state.token}})
            .then(r => {
                if (r.data.status === 1) {
                    console.log(r.data.data);
                    this.setState({audience:r.data.data.expected_audience});
                    //console.log(this.state);
                } else {
                    alert('unsuccessufull');
                }
            }).catch(e => { 
                console.log(e);
            }).finally(()=>{});
        } catch(error) {
            console.log(error);
        };
    }

    setOperationBudget(abudget) {
        this.setState({ budget:abudget });
        this.updateCampaign();
    }

    goHome() {
        const { navigation } = this.props;
        navigation.navigate('CampaignPayment');
    }

    /* update interfaces */

    getPlaceHolder(witch, statusfielderror, message) {
        if (!statusfielderror) {
            return witch;
        } else {
            return witch + " " + message;
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
    const { isLoading, audience } = this.state;
    return (
        <Block  style={styles.container}>
            <Block  center style={{marginBottom:20}}>
                <Input
                    label='Budget'
                    family='Foundation'
                    icon='dollar-bill'
                    iconSize={40}
                    value={this.state.budget}
                    onChange={(e) => this.setOperationBudget(e.nativeEvent.text)}
                    error={this.state.errorbudget}
                    borderless={!this.state.errorbudget}
                    placeholder={this.getPlaceHolder('Budget',this.state.errorname, 'required')}
                />
            </Block>
            <Block style={{marginBottom:40}}>
                <Text h4>Audience: {audience}</Text>
            </Block>
            
            <Block  center>
                {isLoading  ? <ActivityIndicator/> : (
                    <LinearGradient colors={['#66FCF1',  '#46BAB8']}
                    style={{borderRadius: 30}} 
                    start={{ y: 0.0, x: 0.0 }} end={{ y: 0.0, x: 1.1 }}>
                    <Button
                        style={styles.button}
                        color='transparent'
                        padding='0 0 0 0'
                        onPress={() => this.goHome()}
                        textStyle={{ color: argonTheme.COLORS.WHITE, fontWeight: '500'  }}
                    >
                        PAY
                    </Button>
                    </LinearGradient>
                )}
            </Block>
        </Block>
        )
    }

    renderPersonal = () => {
        return (
            
            <Block flex style={styles.container}>
                <Block flex space="between" style={styles.padded}>
                    {this.renderTarget()}
                </Block>
            </Block>
        );
    }

    render() {
        
        return this.renderPersonal()
       
    }

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

export default CampaignAudience;
