/*
 * Copyright 2018 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package main

type TradeAgreement struct {
	Amount             float64 `json:"amount"`
	DescriptionOfGoods string  `json:"description"`
	Status             string  `json:"status"`
	Payment            float64 `json:"payment"`
	Numbers            int     `json:"numbers"`
}

type ShipmentDelivery struct {
	SourcePort      string `json:"sourcePort"`
	DestinationPort string `json:"destinationPort"`
	Location        string `json:"location"`
	StartDate       string `json:"startDate"`
	EndDate         string `json:"endDate"`
	TradeId         string `json:"tradeId"`
}
