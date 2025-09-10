const userAccess = localStorage.getItem("user")

const adminAccess = () => {
    if(userAccess){
        const userData = JSON.parse(userAccess)
        if(userData.role === "admin"){
            return true
        }
    }
    return false
}
export default adminAccess;
