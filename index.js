//
// MP4 - A Pure Javascript Mp4 Container Parser Based On ISO_IEC_14496-12
//

//
// WARNING - This implementation is unfinished.
// TODO - mp4 file stream loading
//	- mp4 file stream offset
//	- mp4 json data output
//	- udta meta data parsing
//

module.exports = function(mp4file) {
	var offset = 0;
	var atom_size = 0;

	var mp4 = {};

	while(offset<file_size) {

		if (atom_type=="ftyp") {
			var major_brand = 0;// read 4 bytes unpacked N
			var minor_version = 0;// read 4 bytes unpacked N
			var compatible_brands = 0; // read 4 bytes

			mp4[ftyp] = {
				"major_brand": major_brand,
				"minor_version": minor_version,
				"compatible_brands": compatible_brands
			}
		} else if (atom_type=="moov") {
			parse_moov(offset);
		}
	}

	offset += atom_size;
	// seek offset
}

var parse_moov = function(offset) {

	var moov_size = 0; // read 4 bytes unpacked N
	var moov_type = 0; // read 4 bytes

	moov_size = offset + moov_size;

	offset += 8;
	while (offset<moov_size) {

		var size = 0; // read 4 bytes unpacked N
		var type = 0; // read 4 bytes

		if (type=="mvhd") {
			parse_mvhd(offset);
		} else if (type=="trak") {
			parse_track(offset);
		} else if (type=="udta") {
			parse_udta(offset);
		}

		offset += size;
		// seek offset
	}
}

var parse_track = function(offset) {

	var track_size = 0; //read 4 bytes unpacked N
	var track_type = 0; //read 4 bytes

	track_offset = offset + track_size;

	offset += 8;
	while(offset<track_size) {
		var size = 0; // read 4 bytes unpacked N
		var type = 0; //read 4 bytes

		if (type=="tkhd") {
			parse_tkhd(offset);
		}

		offset += size;
		// seek offset
	}
}

var parse_tkhd = function(offset) {
	offset += 8
	//seek offset

	var version = 0; // read 1 bytes 8bit unpacked C
	var flags = 0; // read 3 bytes

	var ctime = 0;
	var mtime = 0;
	var track_id = 0;
	var reserved = 0;
	var duration = 0;

	if (version==0) {
		ctime = 0; // read 4 bytes unpacked N
		mtime = 0; // read 4 bytes unpacked N
		track_id = 0; // read 4 bytes unpacked N
		reserved = 0; // read 4 bytes
		duration = 0; // read 4 bytes unpacked N
	} else if (version==1) {
		ctime = 0; // read 8 bytes unpacked Q
		mtime = 0; // read 8 bytes unpacked Q
		track_id = 0; // read 4 bytes unpacked N
		reserved = 0; // read 4 bytes
		duration = 0; // read 4 bytes unpacked Q
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

var parse_mvhd = function(offset) {
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

var parse_udta = function(offset) {

}