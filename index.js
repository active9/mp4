//
// MP4 - A Pure Javascript Mp4 Container Parser Based On ISO_IEC_14496-12
// LICENSE: MIT
// COPYRIGHT: 2015 Active 9 LLC.
//

/*
 *
 * Synopsis:
 *     The MP4 or Motion Picture v4 is a fully adaptive formated losely
 * based on the mpeg / mp3 containers. The origins of the mp4 date back
 * to the year 2000 on IRC. The MPEG group graciously adopted said format
 * and many codecs based on the mp4 container and motion vector technology
 * began to emerge. This paved the way for high quality low bitrate real-time
 * audio/video streaming and recording. Over 15 years later the mp4 container
 * is now the defacto standard installed on billions of devices and in billions
 * of homes world-wide. It has paved the way to future HD audio/video streaming 
 * as well as 3d VR technologies.
 *
 * This library implements the ISO_IEC_14496-12 mp4 container as a parser for
 * nodejs. This is a low-level library designed to work with mp4v1 / mp4v2 codecs.
 *
 */

//
// WARNING - This implementation is unfinished.
// TODO - mp4 file stream loading
//	- mp4 file stream offset
//	- mp4 json data output
//	- udta meta data parsing
//  - make readChunk.sync efficient!

var fs = require('fs');
var path = require('path');
var util = require('util');
var readChunk = require('read-chunk');
var buffer= new Buffer(512000000);

module.exports = function(mp4file) {

	mp4file = path.resolve(mp4file);
	console.log("Parsing ", mp4file);
	var mp4data = fs.openSync(mp4file,'r+');
	var mp4stats = fs.statSync(mp4file);
	var file_size = mp4stats.size;
	console.log("Filesize ", file_size, ' bytes');
	var offset = 0;
	var atom_size = 16; // Boldy Guess The Atom_Size
	var atom_type = "ftyp"; // Default Atom/Box Type

	var mp4 = {
		ftyp: {}
	};

	while(offset<=file_size) {
		//console.log("OFFSET:", offset);

		// Forget The Yellow Pages (aka Brands)
		if (atom_type=="ftyp") {
			mp4.atom_size = readChunk.sync(mp4file, offset+0, 4)[3];
			atom_size = mp4.atom_size;
			atom_type = bufferToChar(readChunk.sync(mp4file, offset+4, 4));
			mp4.major_brand = bufferToChar(readChunk.sync(mp4file, offset+8, 4));
			mp4.minor_version = bufferToChar(readChunk.sync(mp4file, offset+12, 4));
			mp4.compatible_brands = bufferToChar(readChunk.sync(mp4file, offset+16, atom_size-16));

			// seek offset
			offset += atom_size;
			atom_type = 'moov';

		// Motion Object Oriented Vector (aka Moov)
		}
		if (atom_type=="moov") {
			parse_moov(mp4data, buffer, offset);

			// seek offset
			offset += atom_size;
		}
	}

	console.log("Mp4:", mp4);
	fs.closeSync(mp4data);
	return mp4;
}

var bufferToChar = function(buffer) {
	var output = '';
	var i = buffer.length;
	var o = 0;
	while (o<i) {
		output += ''+ String.fromCharCode(buffer[o]) +'';
		o++;
	}
	return output;
}

var parse_moov = function(mp4data, buffer, offset) {
	var moov_size = fs.readSync(mp4data, buffer, offset, 4, 0); // read 4 bytes unpacked N
	var moov_type = fs.readSync(mp4data, buffer, offset, 4, 4); // read 4 bytes
	moov_size = offset + moov_size;

	offset += 8;
	//console.log("SIZING ::", offset, moov_size, offset);
	while (offset<moov_size) {

		var size = fs.readSync(mp4data, buffer, offset, 4, 0); // read 4 bytes unpacked N
		var type = fs.readSync(mp4data, buffer, offset, 4, 4); // read 4 bytes
	//console.log("MOOVE::", size, type);

		// Motion Vector High Definition (aka MVHD)
		if (type=="mvhd") {
			parse_mvhd(mp4data, buffer, offset);

		// Trak (Aka Track)
		} else if (type=="trak") {
			parse_track(mp4data, buffer, offset);

		// User Data Space (aka UDTA)
		} else if (type=="udta") {
			parse_udta(mp4data, buffer, offset);
		}

		offset += size;
		// seek offset
	}
}

var parse_track = function(mp4data, buffer, offset) {

console.log("TRACK");
	var track_size = fs.readSync(mp4data, buffer, offset, 4, 0);; //read 4 bytes unpacked N
	var track_type = fs.readSync(mp4data, buffer, offset, 4, 4);; //read 4 bytes

	track_offset = offset + track_size;

	offset += 8;
	while(offset<track_size) {
		var size = fs.readSync(mp4data, buffer, offset, 4, 0); // read 4 bytes unpacked N
		var type = fs.readSync(mp4data, buffer, offset, 4, 4); //read 4 bytes

		if (type=="tkhd") {
			parse_tkhd(offset);
		}

		offset += size;
		// seek offset
	}
}

var parse_tkhd = function(mp4data, buffer, offset) {
console.log("TKHD");
	offset += 8
	//seek offset

	var version = fs.readSync(mp4data, buffer, offset, 1, 0); // read 1 bytes 8bit unpacked C
	var flags = fs.readSync(mp4data, buffer, offset, 3, 1); // read 3 bytes

	var ctime = 0;
	var mtime = 0;
	var track_id = 0;
	var reserved = 0;
	var duration = 0;
	if (version==0) {
		ctime = fs.readSync(mp4data, buffer, offset, 4, 4); // read 4 bytes unpacked N
		mtime = fs.readSync(mp4data, buffer, offset, 4, 8); // read 4 bytes unpacked N
		track_id = fs.readSync(mp4data, buffer, offset, 4, 12); // read 4 bytes unpacked N
		reserved = fs.readSync(mp4data, buffer, offset, 4, 16); // read 4 bytes
		duration = fs.readSync(mp4data, buffer, offset, 4, 20); // read 4 bytes unpacked N
	} else if (version==1) {
		ctime = fs.readSync(mp4data, buffer, offset, 8, 4); // read 8 bytes unpacked Q
		mtime = fs.readSync(mp4data, buffer, offset, 8, 12); // read 8 bytes unpacked Q
		track_id = fs.readSync(mp4data, buffer, offset, 4, 20); // read 4 bytes unpacked N
		reserved = fs.readSync(mp4data, buffer, offset, 4, 24); // read 4 bytes
		duration = fs.readSync(mp4data, buffer, offset, 4, 28); // read 4 bytes unpacked Q
	}

	reserved = 0; // read 8 bytes
	var layer = 0; // read 2 bytes unpacked N
	var alternate_group = 0; // read 2 bytes unpacked N

	var volume = 0; // read 2 bytes unpacked N

	reserved = 0; // read 2 bytes

	var matrix = 0; //read 36 bytes
	var width = 0; //read 4 bytes unpacked N
	var height = 0; //read 4 bytes unpacked N

	return {
		"ctime": ctime,
		"mtime": mtime,
		"track_id": track_id,
		"duration": duration,
		"layer": layer,
		"alternate_group": alternate_group,
		"volume": volume,
		"width": width,
		"height": height
	}
}

var parse_mvhd = function(mp4data, buffer, offset) {
console.log("MVHD");
	offset += 8;
	// seek offset

	var version = 0; // read 1 bytes 8bit unpacked C
	var flags = 0; // read 3 bytes

	var ctime = 0;
	var mtime = 0;
	var scale = 0;
	var duration = 0;

	if (version==0) {
		ctime = 0; // read 4 bytes unpacked N
		mtime = 0; // read 4 bytes unpacked N
		scale = 0; // read 4 bytes unpacked N
		duration = 0; // read 4 bytes unpacked N
	} else if (version=-1) {
		ctime = 0; // read 8 bytes unpacked Q
		mtime = 0; // read 8 bytes unpacked Q
		scale = 0; // read 4 bytes unpacked N
		duration = 0; // read 8 bytes unpacked Q
	}

	return {
		"ctime": ctime,
		"mtime": mtime,
		"scale": scale,
		"duration": duration
	}
}

var parse_udta = function(mp4data, buffer, offset) {

}