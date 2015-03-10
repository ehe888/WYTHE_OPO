/**
    Configuration module 
*/
module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'development':
            return {
                jsTicketHost: 'localhost',
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/test_wythe_game_opo"
            };
            
        case 'testing':
            return {
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/test_wythe_game_opo"
            };
            
        case 'staging':
            return {
                
            };
            
        case 'production':
            return {
                debug: false,
                dbConStr: "postgres://pguser:001@Helei@10.171.254.62/wythe_game_opo"
            };
        default:
            return {
                debug: true,
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/test_wythe_game_opo"
            };
    }
};
