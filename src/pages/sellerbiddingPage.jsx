import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../app";

function timeSince(timeStamp) {
  var now = new Date(),
    secondsPast = (now.getTime() - timeStamp) / 1000;
  if (secondsPast < 60) {
    return parseInt(secondsPast) + "s";
  }
  if (secondsPast < 3600) {
    return parseInt(secondsPast / 60) + "m";
  }
  if (secondsPast <= 86400) {
    return parseInt(secondsPast / 3600) + "h";
  }
  if (secondsPast > 86400) {
    let day = timeStamp.getDate();
    let month = timeStamp
      .toDateString()
      .match(/ [a-zA-Z]*/)[0]
      .replace(" ", "");
    let year =
      timeStamp.getFullYear() == now.getFullYear()
        ? ""
        : " " + timeStamp.getFullYear();
    return day + " " + month + year;
  }
}
const Sellerbidding = () => {
  let [product, setProduct] = useState(null);
  let [allBids, setAllBid] = useState([]);

  let { authRes, setAuthRes } = useContext(AuthContext);

  let [err, setErr] = useState({
    show: false,
    msg: "",
  });

  let [highestBidder, setHighestBidder] = useState(null);

  let [bidAmount, setBidAmount] = useState(0);

  let params = useParams();

  let fetchBids = async (id) => {
    let bidres = await axios.get("/api/v1/bid/getAllBids/" + id);
    if (bidres.data.res === true) {
      setAllBid(bidres.data.docs);
    }

    let highest = bidres.data.docs[0];

    //calculating the highest bidder
    for (let i = 0; i < bidres.data.docs.length; i++) {
      let bi = bidres.data.docs[0];
      if (highest.amount.amount < bi.amount.amount) {
        highest = bi;
      }
    }

    console.log(highest);

    setHighestBidder(highest);
  };

  let fetchProduct = async () => {
    try {
      let res = await axios.get(
        "/api/v1/product/getDetail/" + params.productId
      );
      fetchBids(res.data.doc._id);

      if (res.data.res) {
        setProduct(res.data.doc);
        setBidAmount(parseInt(res.data.doc.mppk.amount));
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  if (product === null) {
    return <h1>Loading ...</h1>;
  }

  return (
    <div>
      <div className="sell">
        <div className="sell_nav">
          <div className="sell_nav-logo logo">
            Man<span className="span">deal</span>
          </div>
          <div className="sell_nav-profile">
            <img
              src="./images/icons/bell.png"
              alt=""
              className="sell_nav-profile-bell"
            />
            <img
              src="./images/icons/avatar.png"
              alt=""
              className="sell_nav-profile-avatar"
            />
          </div>
        </div>
        <hr className=" mu" />

        <div className="sell-c">
          <div className="sell-c--img">
            <img src={product.image} className="sell-c--img-i" alt="Lemon" />
          </div>

          <div className="sell-c--main">
            <h2 className="sell-c--main-heading">{product.name}</h2>
            <div className="sell-c--main-des">{product.description}</div>
            <div className="sell-c--main-name">
              Sold by {product.createdBy.name}
            </div>
            <div className="sell-c--main-price">
              Min Price:{" "}
              <span className="span">₹{product.mppk.amount}/ kg</span>
            </div>
          </div>
        </div>
        <div className="bidding">
          <div className="bidding_heading">Bidding Status</div>
          <hr className="mu" />
          <div className="bidding_container">
            {allBids.length !== 0 &&
              allBids.map((bid) => {
                return (
                  <div key={bid._id} className="bidding_container-card">
                    <div className="bidding_container-card-main">
                      <div className="bidding_container-card-main-name">
                        {bid.createdBy.name}
                      </div>
                      <div className="bidding_container-card-main-buyer">
                        {timeSince(bid.timestamp)}
                      </div>
                    </div>

                    <div className="bidding_container-card-btn btn-red">
                      ₹{bid.amount.amount}/kg
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <hr className="mu" />

        <div className="sub">
          <h1 className="sub_heading">Sell to higest bidder</h1>
          <hr className="md" />

          {highestBidder !== null ? (
            <div className="sub_input">
              <div className="sub_input-t">
                <div className="sub_input-t-kg">
                  {highestBidder.createdBy.name}
                </div>
                <div className="sub_input-t-chota">
                  {timeSince(highestBidder.timestamp)}
                </div>
              </div>
              <div className="sub_input-btn btn-green">
                ₹{highestBidder.amount.amount}/kg
              </div>
            </div>
          ) : (
            <h4>Loading ...</h4>
          )}

          <div className="sub_message">
            Congratulations, Your product has been sold
          </div>
          <div className="sub_btn btn-blue">Sell</div>
        </div>

        <hr />
      </div>
      <div className="footer"></div>
    </div>
  );
};

export default Sellerbidding;
