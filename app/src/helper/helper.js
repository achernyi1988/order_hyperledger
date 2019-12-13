
class ProgressStatus {



    constructor(){
        this.status = {
            REQUESTED: "active step", ACCEPTED: "disabled step",
            PREPAYMENT: "disabled step", SETOFF: "disabled step",
            DELIVERED: "disabled step", PAID: "disabled step"
        };
    }




    getStatus = () => {
        return this.status;
    }

    setStatus  = (value) => {
        switch (value) {
            case "REQUESTED":
                this.status.REQUESTED = "completed step";
                this.status.ACCEPTED = "active step";
                this.status.PREPAYMENT = "disabled step";
                this.status.SETOFF = "disabled step";
                this.status.DELIVERED = "disabled step";
                this.status.PAID = "disabled step";
                break;
            case "ACCEPTED":
                this.status.REQUESTED = "completed step";
                this.status.ACCEPTED = "completed step";
                this.status.PREPAYMENT = "active step";
                this.status.SETOFF = "disabled step";
                this.status.DELIVERED = "disabled step";
                this.status.PAID = "disabled step";
                break;
            case "PREPAYMENT":
                this.status.REQUESTED = "completed step";
                this.status.ACCEPTED = "completed step";
                this.status.PREPAYMENT = "completed step";
                this.status.SETOFF = "active step";
                this.status.DELIVERED = "disabled step";
                this.status.PAID = "disabled step";
                break;
            case "SETOFF":
                this.status.REQUESTED = "completed step";
                this.status.ACCEPTED = "completed step";
                this.status.PREPAYMENT = "completed step";
                this.status.SETOFF = "completed step";
                this.status.DELIVERED = "active step";
                this.status.PAID = "disabled step";
                break;
            case "DELIVERED":
                this.status.REQUESTED = "completed step";
                this.status.ACCEPTED = "completed step";
                this.status.PREPAYMENT = "completed step";
                this.status.SETOFF = "completed step";
                this.status.DELIVERED = "completed step";
                this.status.PAID = "active step";
                break;
            case "PAID":
                this.status.REQUESTED = "completed step";
                this.status.ACCEPTED = "completed step";
                this.status.PREPAYMENT = "completed step";
                this.status.SETOFF = "completed step";
                this.status.DELIVERED = "completed step";
                this.status.PAID = "completed step";
                break;
            default: //reset
                this.status.REQUESTED = "active step";
                this.status.ACCEPTED = "disabled step";
                this.status.PREPAYMENT = "disabled step";
                this.status.SETOFF = "disabled step";
                this.status.DELIVERED = "disabled step";
                this.status.PAID = "disabled step";
                break;
        }
    }
}

export default new ProgressStatus()