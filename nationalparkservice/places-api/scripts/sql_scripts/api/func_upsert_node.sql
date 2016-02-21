--upsert_node
CREATE OR REPLACE FUNCTION upsert_node(bigint, integer, integer, bigint, boolean, json)
  RETURNS diffresult AS
$BODY$
  DECLARE
    v_id ALIAS FOR $1;
    v_lat ALIAS FOR $2;
    v_lon ALIAS FOR $3;
    v_changeset ALIAS FOR $4;
    v_visible ALIAS FOR $5;
    v_tags ALIAS FOR $6;
    v_timestamp timestamp without time zone;
    v_tile bigint;
    v_redaction integer;
    v_new_id bigint;
    v_new_version bigint;
    v_user_id bigint;
    v_res boolean;
    v_uuid_field text;
    v_uuid text;
    v_unitcode_field text;
    v_unitcode text;
    BEGIN
      -- Set some values
        v_timestamp := now();
        v_tile := tile_for_point(v_lat, v_lon);
        v_uuid_field := 'nps:places_id';
        v_unitcode_field := 'nps:unit_code';
        SELECT
          changesets.user_id
        FROM
          changesets
        WHERE
          changesets.id = v_changeset
        INTO
          v_user_id;

      -- Determine if there needs to be a new node and new verison
    SELECT
      COALESCE((
        SELECT
          node_id
        FROM
          nodes
        WHERE
          node_id = v_id
        LIMIT 1
      ), (
        SELECT
          nextval('node_id_seq')
      )) AS new_id,
      COALESCE((
        SELECT
          MAX(version)
        FROM
          nodes
        WHERE
          node_id = v_id
        GROUP BY
          node_id
        ), 0)
        +1 AS new_version
    INTO
      v_new_id,
      v_new_version;

    INSERT INTO
     nodes (
       node_id,
       latitude,
       longitude,
       changeset_id,
       visible,
       timestamp,
       tile,
       version
     ) VALUES (
       v_new_id,
       v_lat,
       v_lon,
       v_changeset,
       v_visible,
       v_timestamp,
       v_tile,
       v_new_version
     );


-- uuid
  v_uuid := nps_get_value(v_uuid_field, v_tags);
  IF v_uuid IS NULL THEN
   SELECT
     nps_update_value(v_uuid_field, uuid_generate_v4()::text, v_tags)
   INTO
     v_tags;
  END IF;

-- Unit Code
  v_unitcode := nps_get_value(v_unitcode_field, v_tags);
  IF v_unitcode IS NULL THEN
   SELECT
     nps_update_value(v_unitcode_field, nps_get_unitcode(v_lat, v_lon), v_tags)
   INTO
     v_tags;
  END IF;
     
-- Tags
     INSERT INTO
       node_tags (
       SELECT
         v_new_id AS node_id,
         v_new_version AS version,
         k,
         v
       FROM
         json_populate_recordset(
           null::node_tags,
           v_tags
         )
       );

    RETURN (v_id, v_new_id, v_new_version);
    END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION upsert_node(bigint, integer, integer, bigint, boolean, json)
  OWNER TO postgres;
