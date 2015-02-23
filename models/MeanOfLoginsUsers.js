'use strict';


module.exports = function(sequelize, DataTypes) {
    var MeanOfLoginsUsers = sequelize.define('MeanOfLoginsUsers', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        data: {
            type: DataTypes.STRING
        },

        isRemoved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },

    {
        timestamps: false
    });

    return MeanOfLoginsUsers;
};