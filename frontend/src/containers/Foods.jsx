import React, { Fragment, useEffect, useReducer, useState } from 'react';
import styled from 'styled-components';
import { useHistory, Link } from "react-router-dom";
import { NewOrderConfirmDialog } from '../components/NewOrderConfirmDialog';
import { postLineFoods, replaceLineFoods } from '../apis/line_foods';
import { HTTP_STATUS_CODE } from '../constants'


//compornents
import { LocalMallIcon } from '../components/Icons';
import { FoodWrapper } from '../components/FoodWrapper'
import Skeleton from '@material-ui/lab/Skeleton';
import { FoodOrderDialog } from '../components/FoodOrderDialog';

//reducers
import {
  initialState as foodsInitialState,
  foodsActionTypes,
  foodsReducer,
} from '../reducers/foods'

// images
import MainLogo from '../images/logo.png';
import FoodImage from '../images/food-image.jpg';

//apis
import { fetchFoods } from '../apis/foods';

//constants
import { COLORS } from '../style_constants';
import { REQUEST_STATE } from '../constants'

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 32px;
`;

const BagIconWrapper = styled.div`
  padding-top: 24px;
`;

const ColoredBagIcon = styled(LocalMallIcon)`
  color: ${COLORS.MAIN}
`;

const MainLogoImage = styled.img`
  height: 90px;
`

const FoodsList = styled.div`
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-bottom: 50px;
`;

const ItemWrapper = styled.div`
  margin: 16px;
`;



export const Foods = ({ match }) => {
  const [foodsState, dispatch] = useReducer(foodsReducer, foodsInitialState);
  const history = useHistory();

  const initialState = {
    isOpenOrderDialog: false,
    selectedFood: null,
    selectedFoodCount: 1,
    isOpenNewOrderDialog: false,
    existingResutaurantName: '',
    newResutaurantName: '',
  }
  const [state, setState] = useState(initialState)

  useEffect(() => {
    dispatch({ type: foodsActionTypes.FETCHING});
    fetchFoods(match.params.restaurantsId)
    .then((data) => {
      dispatch({
        type: foodsActionTypes.FETCH_SUCCESS,
        payload: {
          foods: data.foods
        }
      });
    })
  },[]);

  const submitOrder = () => {
    postLineFoods({
      foodId: state.selectedFood.id,
      count: state.selectedFoodCount,
    }).then(() => history.push('/orders'))
    .catch((e) => {
      if (e.response.status === HTTP_STATUS_CODE.NOT_ACCEPTABLE) {
        setState({
          ...state,
          isOpenOrderDialog: false,
          isOpenNewOrderDialog: true,
          existingResutaurantName: e.response.data.existing_restaurant,
          newResutaurantName: e.response.data.new_restaurant,
        })
      } else {
        throw e;
      }
    })
  };

  const replaceOrder = () => {
    replaceLineFoods({
      foodId: state.selectedFood.id,
      count: state.selectedFoodCount,
    }).then(() => history.push('/orders'))
  };

  return (
    <Fragment>
      <HeaderWrapper>
        <Link to="/restaurants">
          <MainLogoImage src={MainLogo} alt="main logo" />
        </Link>
        <BagIconWrapper>
          <Link to="orders">
            <ColoredBagIcon fontSize="large" />
          </Link>
        </BagIconWrapper>
      </HeaderWrapper>
      <FoodsList>
        {
          foodsState.fetchState === REQUEST_STATE.LOADING ?
            <Fragment>
              {
                [...Array(12).keys()].map(i =>
                  <ItemWrapper key={i}>
                    <Skeleton key={i} variant="rect" width={450} height={180} />
                  </ItemWrapper>
                )
              }
            </Fragment>
          :
            foodsState.foodsList.map(food =>
              <ItemWrapper key={food.id}>
                <FoodWrapper
                 food={food}
                 onClickFoodWrapper={(food) => setState({
                   ...state,
                   isOpenOrderDialog: true,
                   selectedFood: food,
                 })}
                 imageUrl={FoodImage}
                />
              </ItemWrapper>
            )
        }
      </FoodsList>
      {
        state.isOpenOrderDialog &&
          <FoodOrderDialog
          isOpen={state.isOpenOrderDialog}
          food={state.selectedFood}
          countNumber={state.selectedFoodCount}
          onClickCountUp={() => setState({
            ...state,
            selectedFoodCount: state.selectedFoodCount + 1,
          })}
          onClickCountDown={() => setState({
            ...state,
            selectedFoodCount: state.selectedFoodCount - 1,
          })}
          // 先ほど作った関数を渡します
          onClickOrder={() => submitOrder()}
          // モーダルを閉じる時はすべてのstateを初期化する
          onClose={() => setState({
            ...state,
            isOpenOrderDialog: false,
            selectedFood: null,
            selectedFoodCount: 1,
          })}
          />
      }
      {
        state.isOpenNewOrderDialog &&
        <NewOrderConfirmDialog
        isOpen={state.isOpenNewOrderDialog}
        onClose={() => setState({ ...state, isOpenNewOrderDialog: false})}
        existingResutaurantName={state.existingResutaurantName}
        newResutaurantName={state.newResutaurantName}
        onClickSubmit={() => replaceOrder()}
        />
      }
    </Fragment>
  )
}