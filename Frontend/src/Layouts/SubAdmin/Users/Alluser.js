import React, { useState, useEffect } from "react";
import FullDataTable from "../../../Components/ExtraComponents/Tables/FullDataTable";
import { Link, useLocation } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import ExportToExcel from "../../../Utils/ExportCSV";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { update_Balance } from "../../../ReduxStore/Slice/Admin/Subadmins";
import { fDateTime } from "../../../Utils/Date_formet";
import Loader from "../../../Utils/Loader";
import { GetAllUsers, Get_All_Broker, Show_Status, DeleteUser } from '../../../ReduxStore/Slice/Subadmin/UsersSlice'
import { IndianRupee } from 'lucide-react';
import { AddBalance } from "../../../ReduxStore/Slice/Subadmin/allServices";
import { Radio, RadioTower, UserRoundCog } from "lucide-react";
import { GetUserLogs } from "../../../ReduxStore/Slice/Subadmin/UsersSlice";



export default function AllUsers() {
  const user_id = JSON.parse(localStorage.getItem("user_details")).user_id;
  const admin_id = JSON.parse(localStorage.getItem("user_details"))?.user_id;

  const dispatch = useDispatch();
  const navigate = useNavigate();

 

  const [HeaderNAme, setHeaderNAme] = useState("All Users");

  const [refresh, setrefresh] = useState(false);
  const [modal, setmodal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [ForGetCSV, setForGetCSV] = useState([]);
  const [getAllBroker, setAllBroker] = useState([]);
  const [licenceType, setLicenceType] = useState('null');
  const [BrokerType, setBrokerType] = useState('null');

  const [initialRowData, setInitialRowData] = useState({});
  const [balanceValue, setBalanceValue] = useState("");


  const [userlogs, setUserlogs] = useState([]);

  const [ShowDeleteModal, setShowDeleteModal] = useState(false);
  
  const [modalId, setmodalId] = useState("");
  const [getAllUsers, setAllUsers] = useState({
    loading: true,
    data: [],
    data1: [],
  });

  const location = useLocation();
  var dashboard_filter = location.search.split("=")[1];

  const label = { inputProps: { "aria-label": "Switch demo" } };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
    },
    card: {
      width: "auto",
    },
    boldHeader: {
      fontWeight: "bold",
    },
    headerButton: {
      marginRight: 8,
    },
  };

  const showLicenceName = (row) => {
    if (row.license_type === "0") {
      return "2 Days Only";
    } else if (row.license_type === "1") {
      return "Demo";
    } else {
      return "Live";
    }
  };

  const showBrokerName = (row) => {
    if (row.license_type === "1") {
      return "Demo";
    } else {
      const foundNumber =
        getAllBroker &&
        getAllBroker.find((value) => value.broker_id == row.broker);
      if (foundNumber != undefined) {
        return foundNumber.title;
      } else {
        return "--";
      }
    }
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
      headerClassName: styles.boldHeader,
      renderCell: (params) => (
        <div>
          {" "}
          <b>{params.value + 1}</b>
        </div>
      ),
    },
    {
      field: "FullName",
      headerName: "Full Name",
      width: 160,
      headerClassName: styles.boldHeader,
    },
    {
      field: "UserName",
      headerName: "User name",
      width: 160,
      headerClassName: styles.boldHeader,
    },
    {
      field: "Email",
      headerName: "Email ID",
      width: 220,
      headerClassName: styles.boldHeader,
    },

    {
      field: "PhoneNo",
      headerName: "Phone Number",
      width: 170,
      headerClassName: styles.boldHeader,
    },

    {
      field: "broker",
      headerName: "Broker",
      width: 120,
      headerClassName: styles.boldHeader,
      renderCell: (params) => showBrokerName(params.row),
    },
    {
      field: "license_type",
      headerName: "User Type",
      width: 120,
      headerClassName: styles.boldHeader,
      renderCell: (params) => showLicenceName(params.row),
    },

    {
      field: "ActiveStatus",
      headerName: "Status",
      width: 100,
      headerClassName: styles.boldHeader,
      renderCell: (params) => (
        <div className="status-toggle">
          <input
            id={`rating_${params.row.id}`}
            className="check"
            type="checkbox"
            onChange={(event) => handleSwitchChange(event, params.row._id)}
            defaultChecked={params.value == 1}
          />
          <label
            htmlFor={`rating_${params.row.id}`}
            className="checktoggle checkbox-bg"
          ></label>
        </div>
      ),
    },
    {
      field: "Balance",
      headerName: "Add Balance",
      width: 150,
      headerClassName: styles.boldHeader,
      renderCell: (params) => (
        <div
          style={{
            backgroundColor: '#E1FFED', // Green
            border: 'none',
            color: '#33B469',
            // width: "150px",
            padding: '6px 10px', // Adjusted padding
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '13px',
            // margin: '4px 2px',
            cursor: 'pointer',
            borderRadius: '10px', // Rounded border radius
            transition: 'background-color 0.3s ease',
          }}
          onClick={() => { setmodal(true); setInitialRowData(params.row); }}
        >
          <span style={{ fontWeight: 'bold', verticalAlign: 'middle' }}> +
            <IndianRupee style={{ height: "16px", marginBottom: '-4px', marginRight: '0px', padding: "0" }} />
            {params.value || '-'}
          </span>
        </div>


      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <div>
          <IconButton
            aria-label="edit"
            size="small"
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon />
          </IconButton>
          {params.row.license_type == 1 ? (
            <IconButton
              aria-label="delete"
              size="small"
              onClick={() => {
                handleDeleteConfirmation(params.row._id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          ) : (
            ""
          )}
        </div>
      ),
      headerClassName: styles.boldHeader,
    },
    {
      field: "Broker Response",
      headerName: "Broker Response",
      width: 150,
      renderCell: (params) => (
        <div style={{ marginLeft: "20px" }}>
          <IconButton style={{ color: "blue" }}>
            <Radio onClick={() => handlerbrokerresponse(params.row)} />
          </IconButton>
        </div>
      ),
      headerClassName: styles.boldHeader,
    },
    {
      field: "Activity Logs",
      headerName: "Activity Logs",
      width: 130,
      renderCell: (params) => (
        <div style={{ marginLeft: "20px" }}>
          <IconButton style={{ color: "#ee82ee" }}>
            <RadioTower
              onClick={() => {
                UserActivity_logs(params.row._id);
                setmodal(true);
              }}
            />
          </IconButton>
        </div>
      ),
      headerClassName: styles.boldHeader,
    },
    {
      field: "Clent Service",
      headerName: "Clent Service",
      width: 130,
      renderCell: (params) => (
        <div style={{ marginLeft: "20px" }}>
          <IconButton style={{ color: "#800000" }}>
            <UserRoundCog
              onClick={() => {
                clentuserservice(params.row);
              }}
            />
          </IconButton>
        </div>
      ),
      headerClassName: styles.boldHeader,
    },

    {
      field: "Create_Date",
      headerName: "Created At",
      width: 250,
      headerClassName: styles.boldHeader,
      renderCell: (params) => <div>{fDateTime(params.value)}</div>,
    },
  ];



  const UserActivity_logs = async (_id) => {
    const data = { user_ID: _id };
    await dispatch(GetUserLogs(data))
      .unwrap()
      .then((response) => {
        if (response.status) {
          setUserlogs(response.data);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };



  
  const handleEdit = async (row) => {
    navigate("/subadmin/user/edit/" + row._id);
  };

  // broker response of client
  const handlerbrokerresponse = async (row) => {
    navigate("/subadmin/user/UserBrokerResponse/" + row._id);
  };

  // client service detail
  const clentuserservice = async (row) => {
    navigate("/subadmin/user/UserClientService/" + row._id);
  };




  //  add balance for user


  const AddUserBalance = async () => {
    const data = { id: initialRowData._id, balance: balanceValue,admin_id:admin_id ,status:1};
    await dispatch(AddBalance(data))
      .unwrap()
      .then(async (response) => {
        if (response.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.msg,
            confirmButtonText: 'OK',
          });
          setrefresh(!refresh);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.msg,
            confirmButtonText: 'OK',
          });
        }
      })
      .catch((error) => {
        console.log('Error', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An unexpected error occurred. Please try again later.',
          confirmButtonText: 'OK',
        });
      });

    setBalanceValue('');
    setmodal(false);
  };





  const handleSwitchChange = async (event, id) => {
    const user_active_status = event.target.checked ? 1 : 0;

    const result = await Swal.fire({
      title: "Do you want to save the changes?",
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
    });



    if (result.isConfirmed) {
      try {
        const response = await dispatch(
          Show_Status({ id, user_active_status })
        ).unwrap();
        if (response.status) {
          Swal.fire({
            title: "Saved!",
            icon: "success",
            timer: 1000,
            timerProgressBar: true,
          });
          setTimeout(() => {
            Swal.close();
            setrefresh(!refresh);
          }, 1000);
        } else {
          setrefresh(!refresh);
        }
      } catch (error) {
        console.error("Error", error);
        Swal.fire(
          "Error",
          "There was an error processing your request.",
          "error"
        );
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      window.location.reload();
    }
  };



  const AllBroker = async () => {
    await dispatch(Get_All_Broker())
      .unwrap()
      .then((response) => {
        if (response.status) {
          setAllBroker(response.data);
        } else {
          setAllBroker([]);
        }
      })
      .catch((error) => {
        console.log("Error Broker find Error :", error);
      });
  };

  useState(() => {
    AllBroker();
  }, []);



  const RefreshHandle = () => {
    setSearchInput("");
    setBrokerType("null");
    setLicenceType("null");
    setrefresh(!refresh);
  };




  const forCSVdata = () => {
    let csvArr = [];
    if (getAllUsers.data.length > 0) {
      getAllUsers.data.map((item) => {
        return csvArr.push({
          FullName: item.FullName,
          UserName: item.UserName,
          PhoneNo: item.PhoneNo,
          "Prifix Key": item.prifix_key,
          "Created At": item.createdAt,
        });
      });

      setForGetCSV(csvArr);
    }
  };

  useEffect(() => {
    forCSVdata();
  }, [getAllUsers.data]);


  
  // DELETE SWEET ALERT 2

  const handleDeleteConfirmation = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      var data = { id: id };
      try {
        const response = await dispatch(DeleteUser(data)).unwrap();
        if (response.status) {
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
            timer: 1000,
            timerProgressBar: true,
            onClose: () => {
              setShowDeleteModal(false);
            },
          });
          setmodalId("");
          setrefresh(!refresh);
        } else {
        }
      } catch (error) {
        console.error("There was a problem with the API request:", error);
        Swal.fire({
          title: "Error!",
          text: "There was an error processing your request.",
          icon: "error",
        });
      } finally {
        setShowDeleteModal(false);
      }
    } else {
      setShowDeleteModal(false);
    }
  };



  
  const getUsersData = async () => {
    var data = { user_ID: user_id };
    await dispatch(GetAllUsers(data))
      .unwrap()
      .then((response) => {
        if (response.status) {
          const formattedData =
            response.data &&
            response.data.map((row, index) => ({
              ...row,
              id: index + 1,
            }));
          setHeaderNAme("All Users");

          let formattedData1;
          if (dashboard_filter == 1) {
            formattedData1 = formattedData;
            setHeaderNAme("Total Users");
          } else if (dashboard_filter == undefined) {
            formattedData1 = formattedData;
            setHeaderNAme("All Users");
          } else if (dashboard_filter == 2) {
            formattedData1 = formattedData.filter(
              (item) => item.ActiveStatus == 1
            );
            setHeaderNAme("Active Users");
          } else if (dashboard_filter == 3) {
            formattedData1 = formattedData.filter(
              (item) => item.ActiveStatus == 1
            );
            setHeaderNAme("Expired Users");
          } else if (dashboard_filter == 4) {
            formattedData1 = formattedData.filter(
              (item) => item.license_type == 2
            );
            setHeaderNAme("Total Live Users");
          } else if (dashboard_filter == 5) {
            formattedData1 = formattedData.filter(
              (item) => item.license_type == 2 && item.ActiveStatus == 1
            );
            setHeaderNAme("Active Live Users");
          } else if (dashboard_filter == 6) {
            formattedData1 = formattedData.filter(
              (item) => item.license_type == 2 && item.ActiveStatus == 0
            );
            setHeaderNAme("Expired Live Users");
          } else if (dashboard_filter == 7) {
            formattedData1 = formattedData.filter(
              (item) => item.license_type == 0
            );
            setHeaderNAme("Total 2 days Users");
          } else if (dashboard_filter == 8) {
            formattedData1 = formattedData.filter(
              (item) => item.license_type == 0 && item.ActiveStatus == 1
            );
            setHeaderNAme("Active 2 days Users");
          } else if (dashboard_filter == 9) {
            formattedData1 = formattedData.filter(
              (item) => item.license_type == 0 && item.ActiveStatus == 0
            );
            setHeaderNAme("Expired 2 days Users");
          } else if (dashboard_filter == 10) {
            formattedData1 = formattedData.filter(
              (item) => item.license_type == 1
            );
            setHeaderNAme("Total Demo Users");
          } else if (dashboard_filter == 11) {
            formattedData1 = formattedData.filter(
              (item) => item.license_type == 1 && item.ActiveStatus == 1
            );
            setHeaderNAme("Active Demo Users");
          } else if (dashboard_filter == 12) {
            formattedData1 = formattedData.filter(
              (item) => item.license_type == 1 && item.ActiveStatus == 0
            );
            setHeaderNAme("Expired Demo Users");
          }

          const filterData = formattedData1.filter((item) => {
            const filter1Data =
              licenceType == "null" || item.license_type.includes(licenceType);
            const filter2Data =
              BrokerType == "null" || item.broker == BrokerType;

            const searchInputMatch =
              searchInput == "" ||
              item.FullName.toLowerCase().includes(searchInput.toLowerCase()) ||
              item.UserName.toLowerCase().includes(searchInput.toLowerCase()) ||
              item.PhoneNo.toLowerCase().includes(searchInput.toLowerCase()) ||
              item.prifix_key.toLowerCase().includes(searchInput.toLowerCase());

            return searchInputMatch && filter1Data && filter2Data;
          });

          setAllUsers({
            loading: false,
            data:
              searchInput || licenceType != "null" || BrokerType != "null"
                ? filterData
                : formattedData1,
          });
        } else {
          setAllUsers({
            loading: false,
            data: [],
            data1: [],
          });
        }
      })
      .catch((error) => {
        setAllUsers({
          loading: true,
          data: [],
          data1: [],
        });
      });
  };

  useEffect(() => {
    getUsersData();
  }, [refresh, searchInput, licenceType, BrokerType]);


  return (
    <>
      {!getAllUsers.loading ? (
        <>
          <div className="content container-fluid" data-aos="fade-left">
            <div className="card">
              <div className="card-header">
                <div className="row align-items-center">
                  <div className="col">
                    <h5 className="card-title mb-0">
                      <i className="pe-2 fa-solid fa-users"></i>
                      {HeaderNAme && HeaderNAme}
                    </h5>
                  </div>
                  <div className="col-auto">
                    <div className="list-btn">
                      <ul className="filter-list mb-0">
                        <li className="">
                          <p
                            className="mb-0 btn-filters"
                            data-bs-toggle="tooltip"
                            data-bs-placement="bottom"
                            title="Refresh"
                            onClick={RefreshHandle}
                          >
                            <span>
                              <i className="fe fe-refresh-ccw" />
                            </span>
                          </p>
                        </li>
                        <li className="serach-li">
                          <div className="input-group input-block">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search..."
                              aria-label="Search"
                              aria-describedby="search-addon"
                              onChange={(e) => setSearchInput(e.target.value)}
                              value={searchInput}
                            />
                          </div>
                        </li>
                        <li className="serach-li">
                          <div className="input-group input-block">
                            <select
                              className="rounded form-control border-0 px-4"
                              onChange={(e) => setLicenceType(e.target.value)}
                              value={licenceType}
                            >
                              <option value="null">License Type</option>
                              <option value="1">Demo</option>
                              <option value="0">2 day Live</option>
                              <option value="2">Live</option>
                            </select>
                          </div>
                        </li>
                        <li className="serach-li">
                          <div className="input-group input-block">
                            <select
                              className="rounded form-control border-0 px-4"
                              onChange={(e) => setBrokerType(e.target.value)}
                              value={BrokerType}
                            >
                              <option value="">Broker Type</option>
                              {getAllBroker &&
                                getAllBroker.map((item) => (
                                  <option
                                    key={item.broker_id}
                                    value={item.broker_id}
                                  >
                                    {item.title}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </li>

                        <li>
                          <div
                            className="dropdown dropdown-action"
                            data-bs-toggle="tooltip"
                            data-bs-placement="bottom"
                            title="Download"
                          >
                            <ExportToExcel
                              className="btn btn-primary "
                              apiData={ForGetCSV}
                              fileName={"All Strategy"}
                            />
                          </div>
                        </li>

                        <li>
                          <Link
                            to={"/subadmin/User/add"}
                            className="btn btn-primary"
                          >
                            <i
                              className="fa fa-plus-circle me-2"
                              aria-hidden="true"
                            />
                            Add Users
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <FullDataTable
                  styles={styles}
                  label={label}
                  columns={columns}
                  rows={getAllUsers.data}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <Loader />
      )}

      {modal && (
        <div className="modal custom-modal d-block" id="add_vendor" role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <div className="form-header modal-header-title text-start mb-0">
                  <h4 className="mb-0">Add Fund</h4>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setmodal(false)}
                ></button>
              </div>
              <div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-lg-12 col-sm-12">
                      <div className="input-block mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Fund"
                          onChange={(e) => {
                            const value = e.target.value;
                            const newValue = value.replace(/\D/g, '');
                            e.target.value = newValue;
                            setBalanceValue(e.target.value)
                          }}
                          value={balanceValue}

                        />
                      </div>
                    </div>

                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    data-bs-dismiss="modal"
                    className="btn btn-back cancel-btn me-2"
                    onClick={() => setmodal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    data-bs-dismiss="modal"
                    className="btn btn-primary paid-continue-btn"
                    onClick={AddUserBalance}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      )}

    </>
  );
}
