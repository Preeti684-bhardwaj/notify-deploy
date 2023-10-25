import { useEffect, useState, useCallback } from "react";
import "./CreateNotification.css";
import { Button } from "@mui/material";
import { Frame, Page, Text, Toast } from "@shopify/polaris";
import  notificationImg from "../public/notify.png";
import useFetch from "../hooks/useFetch";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "raviger";
import CircularProgress from "@mui/material/CircularProgress";
import ProductSelection from "../components/ProductSelector/ProductSelection.jsx";
import SegmentSelector from "../components/segmentSelector/SegmentSelector";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  isAuthErrorVisibleAtom,
  productStyleAtom,
  segStyleAtom,
  selectedProductAtom,
  selectedProductIdAtom,
  selectedSegmentsAtom,
  isAlertVisibleAtom
} from "../recoilStore/store.js";
import AlertBanner from "../components/alert/Alert";
import ErrorBanner from "../components/alert/ErrorBanner";

export default function CreateNotification() {
  const [isAuthErrorVisible, setIsAuthErrorVisible] = useRecoilState(
    isAuthErrorVisibleAtom
  );
  const selectedProductId = useRecoilValue(selectedProductIdAtom);
  const setSelectedProduct =
    useSetRecoilState(selectedProductAtom);
  const navigate = useNavigate();
  const [isAlertVisible, setIsAlertVisible] = useRecoilState(isAlertVisibleAtom);
  const  setProductStyle = useSetRecoilState(productStyleAtom);
  const  setSegStyle = useSetRecoilState(segStyleAtom);
  const [titleStyle, setTitleStyle] = useState({});
  const [messageStyle, setMessageStyle] = useState({});
  const [alertMessage, setAlertMessage] = useState({});
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState(""); 
  const [selectedSegments, setSelectedSegments] =
    useRecoilState(selectedSegmentsAtom);
  const [notificationMessage, setNotificationMessage] = useState({
    title: "",
    message: "",
    segments: [],
  });
  const [loading, setLoading] = useState(false);

  let click_action = "";

  //Code to display toast with success message
  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const toastMarkup = active ? (
    <Toast content="Notification Sent!" onDismiss={toggleActive} />
  ) : null;

  //useDataFetcher hook to make API calls
  const useDataFetcher = (initialState, url, options) => {
    const [data, setData] = useState(initialState);
    const fetch = useFetch();
    const fetchData = async () => {
      setData(["Loading..."]);
    const result = await (await fetch(url, options)).json();
    
    if ("message" in result) {
      setData(result.message);
      setLoading(false);
    }
  }
    return [data, fetchData];
  };

  //Code for postNotificationMessage API call
  const postOptions = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ notificationMessage: notificationMessage }),
  };

  //response received from the useDataFetcher hook when sendNotification API is called
  const [notificationMessagePost, fetchNotificactionMessagePost] =
    useDataFetcher("", "/api/sendNotificatication", postOptions);

  useEffect(() => {
    //useEffect to check the response of the post request and display success toast, empty the input fields
    if (notificationMessagePost === "Notification Send Successfylly") {
      toggleActive();
      setTitle("");
      setMessage("");
      setSelectedSegments([]);
      setSelectedProduct("");
    } else if (
      notificationMessagePost === "Request failed with status code 401"
    )
      setIsAuthErrorVisible(true);
    window.scroll(0, 0);
  }, [notificationMessagePost]);
  const handleSend = () => {
    //form validations to make sure that all the details have been entered
    console.log(selectedProductId);
    if (!selectedProductId) {
      setAlertMessage("Please select atleast one product");
      setIsAlertVisible(true);
      setProductStyle({ border: "1px solid red", borderRadius: "5px" });
    } else if (selectedSegments.length < 1) {
      setAlertMessage("Please select atleast one segment");
      setIsAlertVisible(true);
      setSegStyle({ border: "1px solid red", borderRadius: "5px" });
    } else if (title.length < 1) {
      setAlertMessage("Please enter a proper title for the notification");
      setIsAlertVisible(true);
      setTitleStyle({ border: "1px solid red" });
    } else if (message.length < 1) {
      setAlertMessage("Please enter a proper message for the notification");
      setIsAlertVisible(true);
      setMessageStyle({ border: "1px solid red" });
    } else {
      //Code that would be executed if there are no errors in the input
      setNotificationMessage({
        title: title,
        body: message,
        segments: selectedSegments,
      });
    }
  };
  useEffect(()=>{
    setMessageStyle({})
    setIsAlertVisible(false)
  },[message])
  useEffect(()=>{
setTitleStyle({})
setIsAlertVisible(false)
  },[title])
  useEffect(() => {
    //useEffect to make POST request only when all the fields are available
    if (
      notificationMessage.title &&
      notificationMessage.body &&
      notificationMessage.segments.length > 0
    ) {
      fetchNotificactionMessagePost();
      setLoading(true);
      setIsAlertVisible(false);
    }
  }, [notificationMessage]);

  useEffect(() => {
    click_action = `https://productID?productID=${selectedProductId}`;
  }, [selectedProductId]);
  return (
    <Page>
      <Frame>
        {isAuthErrorVisible && (
          <AlertBanner
            alertMessage="Please enter a valid Firebase Server Key."
            alertTitle="Authentication Error!"
          />
        )}
        <Button
          id="settingsBtn"
          variant="contained"
          onClick={() => navigate("/settings")}
        >
          <SettingsIcon />
        </Button>
        <div className="container">
          <div className="head">
            <Text variant="headingXl" id="Heading">
              {" "}
              <img className="notifyPic" src={notificationImg}></img>
              Notifications
            </Text>
            <Text variant="headingMd" id="subHeading">
              Enter below details to send personalized notifications.
            </Text>
          </div>
          <div className="body">
            {isAlertVisible && <ErrorBanner alertMessage={alertMessage} />}
            <ProductSelection />
            <SegmentSelector />
            <div className="titleSection" style={titleStyle}>
              <label htmlFor="">Title*</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Please click here to add a short and descriptive title"
              />
            </div>
            <div className="titleSection" style={messageStyle}>
              <label htmlFor="">Body*</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                type="text"
                rows={5}
                placeholder="Please click here to add some body text"
              />
            </div>
            <div className="bottomSection">
              <Button id="sendBtn" variant="contained" onClick={handleSend}>
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </div>
        </div>
        {toastMarkup}
      </Frame>
    </Page>
  );
}
