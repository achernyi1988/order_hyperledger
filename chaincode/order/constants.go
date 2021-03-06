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

// Key names
const (
	expKey    = "Exporter"
	ebKey     = "ExportersBank"
	expBalKey = "ExportersAccountBalance"
	impKey    = "Importer"
	ibKey     = "ImportersBank"
	impBalKey = "ImportersAccountBalance"
	carKey    = "Carrier"
	raKey     = "RegulatoryAuthority"
)

// State values
const (
	REQUESTED  = "REQUESTED"
	ACCEPTED   = "ACCEPTED"
	PREPAYMENT = "PREPAYMENT"
	SETOFF     = "SETOFF"
	DELIVERED  = "DELIVERED"
	PAID       = "PAID"
	CLOSED     = "CLOSED"
)

// Location values
const (
	SOURCE      = "SOURCE"
	DESTINATION = "DESTINATION"
)
