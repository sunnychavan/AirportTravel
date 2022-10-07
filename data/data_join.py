import pandas as pd
import os


def aggregate_flights():
    csvFile = pd.read_csv("flights.csv")
    counts = (
        csvFile.groupby(["OriginAirportID", "DestAirportID"])
        .size()
        .to_frame("num_flights")
    )

    return counts


def substitute_names(df):
    named_df = pd.read_csv("airports.csv")

    result = df.join(
        named_df.set_index("airport_id").add_prefix("origin_"), on="OriginAirportID"
    ).join(named_df.set_index("airport_id").add_prefix("dest_"), on="DestAirportID")

    return result


def add_city_details(df):
    city_df = pd.read_csv("cities.csv")
    # city_df = city_df[city_df["state"] != "PR"]

    result = df.join(
        city_df.set_index(["state", "city"]).add_prefix("origin_"),
        on=["origin_state", "origin_city"],
        how="inner",
    ).join(
        city_df.set_index(["state", "city"]).add_prefix("dest_"),
        on=["dest_state", "dest_city"],
        how="inner",
    )

    return result


def flight_throughput(df):
    result = df.groupby(["origin_state", "origin_city"]).sum()

    return result


def add_city_popu(df):
    popu_df = pd.read_csv("population.csv")

    result = df.join(
        popu_df.set_index(["state", "city"]),
        on=["origin_state", "origin_city"],
        how="inner",
    )

    return result


if __name__ == "__main__":
    abspath = os.path.abspath(__file__)
    dname = os.path.dirname(abspath)
    os.chdir(dname)

    agg_flts = aggregate_flights()
    named = substitute_names(agg_flts)
    map_data = add_city_details(named)

    throughput = flight_throughput(named)
    scatter_data = add_city_popu(throughput)

    map_data.to_csv("map_data.csv")
    scatter_data.to_csv("scatter_data.csv")
