//import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import PropTypes from 'prop-types';
//import { useState } from 'react';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

class MyList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      submit: '',
      items: [],
      buttonId: null,
      showModal: false,
      selectedIndex: null,
      listTotal: 0,
      createdDate: new Date(),
      formattedDate: new Date().toLocaleDateString('en-us', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }),
      listActive: false, 
      id: null,
      inputError: false
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.incrementQuantity = this.incrementQuantity.bind(this);
    this.decrementQuantity = this.decrementQuantity.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.updatePrice = this.updatePrice.bind(this);
    this.updateQuantity = this.updateQuantity.bind(this);
    this.itemListTotal = this.itemListTotal.bind(this);
    this.saveListToLocalStorage = this.saveListToLocalStorage.bind(this);
    this.loadList = this.loadList.bind(this);
    this.resetState = this.resetState.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // Check if the specific property has changed
    if (prevState.items !== this.state.items) {
      this.itemListTotal();
    }
  }

  handleChange(event) {
    this.setState({
      input: event.target.value
    });
    const pattern = /^[A-Za-z0-9 ]+$/;
    if (!pattern.test(event.target.value) || event.target.value === ' ') {
      this.setState((state) => {
        return { 
          inputError: true 
        };
      });
    } else {
      this.setState((state) => {
        return {
          inputError: false
        };
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    const quantity = 1;
    const priceEach = 0;
    const itemObj = {item: this.state.input, quantity: quantity, priceEach: priceEach, priceTotal: (priceEach * quantity)}
    if (this.state.input !== '') {
        this.setState((state) => ({
        submit: state.input,
        items: [ itemObj, ...state.items],
        input: '',
        listActive: true,
        id: state.id === null ? uuidv4() : state.id
    }));
    }
  }

  removeItem(index) {
    this.setState({
      items: this.state.items.filter((item, i) => i !== index),
    }, () => { 
      if (this.state.items.length === 0)
      this.resetState(this.state); 
    });

  }

  resetState(state) {
    console.log('reset state running...');
    if (state.items.length === 0) {
      this.setState({
        createdDate: new Date(),
        formattedDate: new Date().toLocaleDateString('en-us', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }),
        id: null,
        listActive: false
      })
    } else {
      return;
    }
  }

  incrementQuantity(index) {
    this.setState((state) => {
      const newItems = state.items.map((item, i) => {
        if (i === index) {
          console.log('Price:', item.priceEach);
          console.log('Quantity:', item.quantity);
          console.log('Result:', (item.priceEach * (item.quantity + 1)));
          return { ...item, quantity: item.quantity + 1, priceTotal: (item.priceEach * (item.quantity + 1)) }; // Increment quantity
        }
        return item; // Return the item unchanged
      });
      return { items: newItems }; // Update the items array
    });
  }

  decrementQuantity(index) {
    this.setState((state) => {
      const newItems = state.items.map((item, i) => {
        if (i === index) {
          return { ...item, quantity: Math.max(item.quantity - 1, 0), priceTotal: (item.priceEach * (Math.max(item.quantity - 1, 0))) }; // Decrement quantity, prevent negative
        }
        return item; // Return the item unchanged
      });
      return { items: newItems }; // Update the items array
    });
  }

  updateQuantity(index, quantity) {
    try {
      this.setState((state) => {
        const newItems = state.items.map((item, i) => {
          if (i === index) {
            return { ...item, quantity: quantity, priceTotal: (item.priceEach * quantity) }
          }
          return item;
        });
        return { items: newItems };
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  openModal(id, index) {
    console.log('index is:', index);
    this.setState((state) => {
      return { showModal: true,
                buttonId: id,
                selectedIndex: id === 'editBtn' ? index : null
      };
    });
  }

  closeModal() {
    this.setState((state) => {
      return { showModal: false,
                buttonId: null,
                selectedIndex: null
      };
    });
  }

  updatePrice(index, price) {
    console.log('update price running...', 'index:', index, 'price:', price);
    try {
      this.setState((state) => {
        const newItems = state.items.map((item, i) => {
          if (i === index) {
            return { ...item, priceEach: price, priceTotal: (price * item.quantity) };
          }
          return item;
        });
        return { items: newItems };
      })
    } catch (error) {
      console.error('Error updating price:', error);
    }  
  }
  
  itemListTotal() {
    console.log('total before:', this.state.listTotal, typeof this.state.listTotal);
    this.setState((state) => {
      const total = state.items.reduce((accumulator, current) => {
        return accumulator + current.priceTotal;
      }, 0);
      
      return { listTotal: total }; // Set the calculated total in the state
    }, () => {
      // This callback runs after the state has been updated
      console.log('total after:', this.state.listTotal, typeof this.state.listTotal);
    });
  }

  saveListToLocalStorage() {
    try {
      const list = this.state;
      if (list.listActive === false) {
        return;
      } else {
        const prevLists = localStorage.getItem('shoppingLists') ? JSON.parse(localStorage.getItem('shoppingLists')) : [];
        if (prevLists.some((item) => item.id === list.id)) {
          const updatedList = prevLists.map((listItem, i) => {
            if (list.id === listItem.id) {
              return {
                ...listItem, items: list.items
              };
            }
            return listItem;
          })
          localStorage.setItem('shoppingLists', JSON.stringify(updatedList));
          console.log('Lists saved to local storage:', JSON.parse(localStorage.getItem('shoppingLists')));
        } else {
          const updatedList = [ list, ...prevLists ];
          localStorage.setItem('shoppingLists', JSON.stringify(updatedList));
        }

      }

    } catch (error) {
      console.error('Error saving list to local storage:', error);
    }
  }

  loadList(listItem) {
    console.log('loadList running...', listItem);
    this.setState(listItem);
  }

  render() {
    const submitBtnDisabled = this.state.inputError;
    return (
      <div className='container-fluid ps-0 pe-0 vh-100 d-flex flex-column min-h-500px max-w-960px'>
        {this.state.showModal && <MenuModal buttonId={this.state.buttonId} closeModal={this.closeModal} loadList={this.loadList} 
        index={this.state.selectedIndex} updatePrice={this.updatePrice} listActive={this.state.listActive} />}
        <div className='p-3 container-fluid d-flex flex-column flex-fill overflow-hidden bg-dark'>
          <h1 className="mb-3 text-white">My Shopping List</h1>
          <MyInput id="itemSubmit" handleChange={this.handleChange} handleSubmit={this.handleSubmit} input={this.state.input} submitDisabled={submitBtnDisabled}/>
          {this.state.inputError && <span className='text-danger pb-3'>Alphanumeric characters only!</span>}
          <ul className="list-unstyled d-flex flex-column bg-dark flex-fill overflow-y-auto hide-scrollbar hide-scrollbar::-webkit-scrollbar p-1">
            {this.state.items.map((item, index) => (
              <ListItem key={index} 
              index={index} 
              item={item} 
              removeItem={this.removeItem} 
              incrementQuantity={this.incrementQuantity} 
              decrementQuantity={this.decrementQuantity} 
              updateQuantity={this.updateQuantity} 
              openModal={this.openModal} />
            ))}
          </ul>
        </div>
        <div className='mt-auto d-flex flex-row align-items-center p-3 border-top'>
          <p className='m-auto fs-4'>List total: <span className='text-success fw-bold'>${this.state.listTotal.toFixed(2)}</span></p>
        </div>
        <div className='mt-auto d-flex flex-row align-items-center bg-dark bg-gradient text-white p-4'>
          <button id="menuBtn" className="btn btn-outline-light m-auto"><i className="bi bi-gear" onClick={() => this.openModal('menuBtn')} /></button>
          <button id="loadBtn" className="btn btn-outline-light m-auto"><i className="bi bi-collection" onClick={() => this.openModal('loadBtn')} /></button>
          <button id="saveBtn" className="btn btn-outline-light m-auto"><i className="bi bi-floppy" onClick={() => { this.saveListToLocalStorage(); this.openModal('saveBtn');}} /></button>
        </div>
      </div>

      
    )
  }
}
MyList.propTypes = {
  input: PropTypes.string.isRequired
}

class MenuModal extends React.Component{
  render() {
    const { buttonId, index, updatePrice, closeModal, listActive, loadList } = this.props;
    const title = { editBtn: 'Update Item Price', menuBtn: 'Settings Menu', loadBtn: 'Saved Lists', saveBtn: 'Save Current List'};
    return (
      <div className="modal modal-fullscreen show" tabIndex="-1" id='menuModal' style={{display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
          <div className="modal-dialog m-0">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{title[buttonId]}</h5>
                <button type="button" className="btn-close" onClick={() => closeModal()} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {buttonId === 'menuBtn' ? <SettingsMenuModal /> 
                : buttonId === 'editBtn' ? <UpdatePriceModal updatePrice={updatePrice} index={index} closeModal={closeModal} /> 
                : buttonId === 'loadBtn' ?<LoadListModal loadList={loadList} />
                : <SaveListModal listActive={listActive} closeModal={closeModal}/>}
              </div>
            </div>
          </div>
        </div>
        
    );
  }
}

class UpdatePriceModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      inputError: false
    };
  }
  handleInputChange = (event) => {
    const value = event.target.value;
    const pattern = /^[0-9.]+$/;
  
    this.setState({
      input: value, // Set the raw input value
      inputError: !pattern.test(value) // Validate the input
    });
  }

  render() {
    const { index, updatePrice, closeModal } = this.props;
    const updateBtnDisabled = this.state.inputError === true ? true : false;
    return (
      <div className='d-flex flex-column'>
        <input type="text" className="form-control" value={this.state.input} placeholder='Enter a price...' onChange={this.handleInputChange} />
        {this.state.inputError && <span className='text-danger pt-3'>Numbers only!</span>}
        <button className='btn btn-primary mt-3' 
        onClick={() => {
          updatePrice(index, parseFloat(this.state.input));
          closeModal();
          }}
          disabled={updateBtnDisabled}>
        Update
        </button>
      </div>
    )
  }
}
UpdatePriceModal.propTypes = {
  index: PropTypes.number.isRequired,
  updatePrice: PropTypes.func.isRequired
};

class SettingsMenuModal extends React.Component {
  render() {
    return (
      <div>
        <p>Settings Menu</p>
      </div>
    )
  }
}

class LoadListModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storedLists: JSON.parse(localStorage.getItem('shoppingLists'))
    }
  }
  componentDidMount() {
    if (this.state.storedLists.length === 0) {
      return;
    } else {
      const sortedLists = this.state.storedLists.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
      this.setState({ storedLists: sortedLists });
    }
  }

  handleLoad = (event, lists, loadList) => {
    console.log('handle load running...');
    const listItem = event.target.closest('li');
    const index = listItem.getAttribute('data-index');
    console.log('list item index is:', index, 'list item:', lists[index]);
    loadList(lists[index]);
  }

  handleDelete = (event, lists) => {
    console.log('handle delete running...');
    const listItem = event.target.closest('li');
    const index = parseInt(listItem.getAttribute('data-index'), 10);
    console.log('list item index is:', index, 'list item:', lists[index]);
    const updatedLists = lists.filter((list, i) => i !== index);
    console.log('updated lists:', updatedLists);
    this.setState({ storedLists: updatedLists }, () => { localStorage.setItem('shoppingLists', JSON.stringify(this.state.storedLists)); });
  }
  
  render() {
    const { storedLists } = this.state;
    const { loadList } = this.props;
    console.log('loading lists:', storedLists);
    return (
      <div>
        <p>Choose a list to load...</p>
        <ul className='list-unstyled card bg-light px-2 pt-2 d-flex flex-column max-h-200px min-h-100px overflow-y-auto hide-scrollbar hide-scrollbar::-webkit-scrollbar inner-shadow'>
          {storedLists.length !== 0 ? storedLists.map((list,index) => {
            return (
            <li key={index} data-index={index} className='d-inline-flex flex-row align-items-center justify-content-between mb-2'>
              <span>{list.formattedDate}</span>
              <div className='ms-auto d-inline-flex flex-row w-auto'>
                <button className='btn btn-primary me-2' onClick={(event) => this.handleLoad(event, storedLists, loadList)}>
                Load
                </button>
                <button className='btn btn-danger' onClick={(event) => this.handleDelete(event, storedLists)}>
                  <i className='bi bi-trash' />
                </button>
              </div>
            </li>
            );
          }) : <li className='text-center'>No saved lists found!</li>}
        </ul>
      </div>
    )
  }
}

class SaveListModal extends React.Component {
  render() {
    const { listActive, closeModal } = this.props;
    const styles = {
      isTrue: 'text-success text-center',
      isFalse: 'text-danger text-center'
    };

    return (
      <div className='d-flex flex-column'>
        <p className={listActive === false ? styles.isFalse : styles.isTrue}>{listActive === false ? 'You must add something to your list to save it!' : 'List saved!'}</p>
        <button className='btn btn-primary mx-auto mt-2' onClick={() => closeModal()}>Close</button>
      </div>
    )
  }
}

class MyInput extends React.Component {
  render() {
    return (
      <div>
        <form onSubmit={this.props.handleSubmit} className='d-flex flex-column mb-3'>
          <div className='input-group'>
            <input type="text" className='form-control' onChange={this.props.handleChange} value={this.props.input} maxLength={20} placeholder='Add items (Max 20 Character)'/>
            <button className="btn btn-primary w-auto" type="submit" onClick={this.props.handleSubmit} disabled={this.props.submitDisabled}>Submit</button>
          </div>
          {this.props.input.length > 19 && <p className='text-danger mt-1'>Character limit reached!</p>}
        </form>
      </div>
      
    )
  }
}

class ListItem extends React.Component {
  render() {
    const { item, index } = this.props;

    const handleInputChange = (event) => {
      const value = event.target.value; // Get the raw input value
      if (value === '') {
        this.props.updateQuantity(index, 0); // Set quantity to 0 or handle as needed
      } else {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue) && parsedValue >= 0) { // Allow 0 or positive values
          this.props.updateQuantity(index, parsedValue); // Update quantity in parent
        }
      }
    };

    return (
      <li key={this.props.index} className='p-2 card bg-light mb-2 d-flex flex-row justify-content-between align-items-center'>
        <div className="d-flex flex-column w-100">
          <div className='d-flex flex-row justify-content-center align-items-center w-100 border-bottom border-1 pb-3'>
            <button className="btn btn-primary" onClick={() => this.props.incrementQuantity(index)}>
              <i className="bi bi-plus text-white" />
            </button>
            <input
              type='number'
              className="form-control w-15 ms-1 me-1 max-w-50px"
              value={item.quantity}
              onChange={handleInputChange}
              step="0.1" // Allow decimal input
              min="0" // Prevent negative
            />
            <button className="btn btn-primary" onClick={() => this.props.decrementQuantity(index)}>
              <i className="bi bi-dash text-white" />
            </button>
            <p className="fs-4 m-auto ps-2 pe-2 break-words w-auto">{item.item}</p>
            <button className='btn btn-danger ms-auto' onClick={() => this.props.removeItem(index)}>
              <i className="bi bi-trash" />
            </button>
          </div>
          <div className="d-flex flex-row justify-content-between align-items-center w-100">
            <div className="d-flex flex-row w-100 fs-5 line-height-1">
              <p className='m-0 mt-auto mb-auto p-0'>Each: <em>${item.priceEach.toFixed(2)}</em></p>
              <i id="editBtn" className="btn bi bi-pencil h-auto" onClick={() => this.props.openModal("editBtn", index)} />
              <p className='p-0 mt-auto mb-auto ms-auto text-success'><em>${item.priceTotal.toFixed(2)}</em></p>
            </div>
          </div>
        </div>
      </li>
    );
  }
}

export default MyList;
